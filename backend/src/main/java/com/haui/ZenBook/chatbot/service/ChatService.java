package com.haui.ZenBook.chatbot.service;

import com.haui.ZenBook.chatbot.dto.ChatRequest;
import com.haui.ZenBook.chatbot.entity.ChatMessage;
import com.haui.ZenBook.chatbot.entity.ChatSession;
import com.haui.ZenBook.chatbot.repository.ChatMessageRepository;
import com.haui.ZenBook.chatbot.repository.ChatSessionRepository;
import com.haui.ZenBook.entity.MembershipEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.repository.MembershipRepository;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository; // 👉 Đã thêm để tra cứu hạng điểm
    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    @Transactional
    public Flux<String> processChatStream(ChatRequest request) {
        ChatSession session = getOrCreateSession(request);
        saveMessage(session, "USER", request.getMessage());
        List<Message> history = loadChatHistory(session.getId());

        String userContext = buildUserContext(request.getUserId());
        StringBuilder fullAiResponse = new StringBuilder();

        // 👉 RAG RETRIEVAL: Tìm kiếm kiến thức liên quan từ Vector DB
        List<org.springframework.ai.document.Document> relevantDocs =
                vectorStore.similaritySearch(
                        org.springframework.ai.vectorstore.SearchRequest.query(request.getMessage()).withTopK(2)
                );

        String ragContext = relevantDocs.stream()
                .map(org.springframework.ai.document.Document::getContent)
                .collect(Collectors.joining("\n---\n"));

        // 👉 RAG PROMPT ENGINEERING VỚI CÁC KỊCH BẢN ĐỈNH CAO
        String finalSystemPrompt = String.format("""
    %s
    🧠 KIẾN THỨC CƠ SỞ (TÀI LIỆU CỦA ZENBOOK):
    %s
    
    🚨 KỶ LUẬT HIỂN THỊ (QUAN TRỌNG):
    - Sử dụng Markdown gọn gàng. Tuyệt đối không chèn thêm dòng trống giữa các mục trong danh sách.
    - Định dạng danh sách theo kiểu: "- [Tên Sách](/products/slug) | Giá | Tồn kho".
    - Khi liệt kê nhiều sách, hãy viết sát dòng nhau.
    
    🚨 KỊCH BẢN HÀNH ĐỘNG:
    ... (các kịch bản cũ của bạn) ...
    
    LƯU Ý: Mọi đường link sách BẮT BUỘC dùng slug: [Tên Sách](/products/book-slug).
    """, userContext, (ragContext.isBlank() ? "Không tìm thấy tài liệu phù hợp." : ragContext));

        return chatClient.prompt()
                .system(finalSystemPrompt)
                .messages(history)
                // 👉 Đăng ký đầy đủ toàn bộ Tools đã cấu hình
                .functions("searchBookTool", "checkOrderTool", "checkCouponTool",
                        "addToCartTool", "viewCartTool", "updateCartTool", "removeCartTool",
                        "checkPurchaseHistoryTool", "getCheckoutLinkTool", "suggestRelatedBooksTool")
                .stream()
                .content()
                .doOnNext(fullAiResponse::append)
                .doOnComplete(() -> {
                    if (!fullAiResponse.isEmpty()) {
                        saveMessage(session, "ASSISTANT", fullAiResponse.toString());
                    }
                });
    }

    // --- HÀM TÌM KIẾM KIẾN THỨC (RETRIEVAL) ---
    private String searchKnowledgeBase(String query) {
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(query)
                        .withTopK(3)
                        .withSimilarityThreshold(0.5)
        );

        if (similarDocuments.isEmpty()) {
            return "Không tìm thấy thông tin cụ thể trong dữ liệu cửa hàng.";
        }

        return similarDocuments.stream()
                .map(Document::getContent)
                .collect(Collectors.joining("\n\n"));
    }

    // --- XÂY DỰNG CONTEXT TỰ ĐỘNG CÓ HẠNG ĐIỂM ---
    private String buildUserContext(String userId) {
        if (userId == null || userId.equals("GUEST") || userId.isBlank()) {
            return "THÔNG TIN KHÁCH HÀNG: Đây là khách vãng lai. Hãy xưng hô là 'bạn'. Không thể tra cứu đơn hàng hay lịch sử mua hàng.";
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String name = user.getFullName();
            if (name == null || name.isBlank()) name = user.getRealUsername();
            if (name == null || name.isBlank()) name = user.getEmail();

            // 👉 Lấy hạng thành viên và dịch sang tiếng Việt + Gắn Emoji
            Optional<MembershipEntity> memOpt = membershipRepository.findByUserId(userId);
            String rawTier = memOpt.map(m -> m.getTier().name()).orElse("MEMBER");

            String tierWithEmoji = switch (rawTier) {
                case "SILVER" -> "Bạc 🥈";
                case "GOLD" -> "Vàng 🥇";
                case "PLATINUM" -> "Bạch Kim 💠";
                case "DIAMOND" -> "Kim Cương 💎";
                default -> "Mới 🌱";
            };

            int points = memOpt.map(MembershipEntity::getAvailablePoints).orElse(0);

            return String.format("""
                THÔNG TIN KHÁCH HÀNG ĐANG CHAT VỚI BẠN:
                - Tên gọi: %s
                - Email: %s
                - ID Hệ Thống: %s
                - Hạng Thành Viên: %s
                - Điểm tích lũy: %d ZPoints
                
                ⚠️ YÊU CẦU:
                1. Gọi khách bằng tên thân thiện.
                2. Tuyệt đối không tiết lộ ID Hệ Thống.
                3. Nếu khách là hạng Bạch Kim 💠 hoặc Kim Cương 💎, hãy nhắc họ rằng họ luôn được FREESHIP mọi đơn hàng.
                """, name, user.getEmail(), user.getId(), tierWithEmoji, points);
        }
        return "THÔNG TIN KHÁCH HÀNG: Không tìm thấy thông tin chi tiết.";
    }

    // --- Helper Methods ---
    private ChatSession getOrCreateSession(ChatRequest request) {
        if (request.getSessionId() != null) {
            return sessionRepository.findById(request.getSessionId())
                    .orElseGet(() -> createNewSession(request.getUserId()));
        }
        return createNewSession(request.getUserId());
    }

    private ChatSession createNewSession(String userId) {
        String finalUserId = (userId != null) ? userId : "GUEST";
        ChatSession session = ChatSession.builder()
                .userId(finalUserId)
                .title("Chat " + java.time.LocalDate.now())
                .build();
        return sessionRepository.save(session);
    }

    private void saveMessage(ChatSession session, String role, String content) {
        ChatMessage msg = ChatMessage.builder()
                .session(session).role(role).content(content).build();
        messageRepository.save(msg);
    }

    private List<Message> loadChatHistory(Long sessionId) {
        List<ChatMessage> lastMsgs = messageRepository.findLatestMessages(sessionId, PageRequest.of(0, 10));
        Collections.reverse(lastMsgs);
        List<Message> messages = new ArrayList<>();
        for (ChatMessage m : lastMsgs) {
            if ("USER".equals(m.getRole())) messages.add(new UserMessage(m.getContent()));
            else messages.add(new AssistantMessage(m.getContent()));
        }
        return messages;
    }
}