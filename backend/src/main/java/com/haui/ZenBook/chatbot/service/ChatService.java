package com.haui.ZenBook.chatbot.service;

import com.haui.ZenBook.chatbot.dto.ChatRequest;
import com.haui.ZenBook.chatbot.entity.ChatMessage;
import com.haui.ZenBook.chatbot.entity.ChatSession;
import com.haui.ZenBook.chatbot.repository.ChatMessageRepository;
import com.haui.ZenBook.chatbot.repository.ChatSessionRepository;
import com.haui.ZenBook.entity.UserEntity;
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
    private final ChatClient chatClient;
    // 👉 1. Inject VectorStore để thực hiện truy vấn RAG
    private final VectorStore vectorStore;

    @Transactional
    public Flux<String> processChatStream(ChatRequest request) {
        ChatSession session = getOrCreateSession(request);
        saveMessage(session, "USER", request.getMessage());
        List<Message> history = loadChatHistory(session.getId());

        String userContext = buildUserContext(request.getUserId());
        StringBuilder fullAiResponse = new StringBuilder();

        // 👉 RAG RETRIEVAL: Tìm kiếm kiến thức liên quan từ Vector DB
        // Search top 2 tài liệu liên quan nhất
        List<org.springframework.ai.document.Document> relevantDocs =
                vectorStore.similaritySearch(
                        org.springframework.ai.vectorstore.SearchRequest.query(request.getMessage()).withTopK(2)
                );

        // Nén các đoạn văn bản tìm được lại
        String ragContext = relevantDocs.stream()
                .map(org.springframework.ai.document.Document::getContent)
                .collect(java.util.stream.Collectors.joining("\n---\n"));

        // 👉 RAG PROMPT ENGINEERING: Trộn RAG Context vào System Prompt
        String finalSystemPrompt = String.format("""
            %s
            
            🧠 KIẾN THỨC CƠ SỞ (TÀI LIỆU CỦA ZENBOOK):
            %s
            
            HƯỚNG DẪN TRẢ LỜI RAG:
            - Dựa VÀO các thông tin trong phần KIẾN THỨC CƠ SỞ ở trên để trả lời câu hỏi của khách nếu câu hỏi liên quan đến chính sách, vận chuyển, đổi trả, hoặc tư vấn sách chung chung.
            - Nếu câu hỏi yêu cầu tìm kiếm đầu sách cụ thể, đơn hàng, hoặc giỏ hàng, hãy ưu tiên dùng các TOOL tương ứng.
            - Nếu thông tin không có trong KIẾN THỨC CƠ SỞ và cũng không thể dùng TOOL, hãy lịch sự từ chối và nói rằng bạn không biết. KHÔNG TỰ BỊA CHÍNH SÁCH.
            """, userContext, (ragContext.isBlank() ? "Không tìm thấy tài liệu tham khảo phù hợp." : ragContext));

        return chatClient.prompt()
                .system(finalSystemPrompt) // Nạp cái Prompt siêu to khổng lồ này vào
                .messages(history)
                .functions("searchBookTool", "checkOrderTool", "checkCouponTool", "addToCartTool","viewCartTool", "updateCartTool", "removeCartTool")
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
        // Tìm top 3 tài liệu liên quan nhất với độ tương đồng (similarity) trên 0.5 (tùy chỉnh nếu cần)
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

    // --- XÂY DỰNG CONTEXT TỰ ĐỘNG ---
    private String buildUserContext(String userId) {
        if (userId == null || userId.equals("GUEST") || userId.isBlank()) {
            return "THÔNG TIN KHÁCH HÀNG: Đây là khách vãng lai. Hãy xưng hô là 'bạn'. Không thể tra cứu đơn hàng.";
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String name = user.getFullName();
            if (name == null || name.isBlank()) name = user.getRealUsername();
            if (name == null || name.isBlank()) name = user.getEmail();

            return String.format("""
                THÔNG TIN KHÁCH HÀNG ĐANG CHAT VỚI BẠN:
                - Tên gọi: %s
                - Email: %s
                - ID Hệ Thống: %s
                
                ⚠️ YÊU CẦU:
                1. Gọi khách bằng tên %s thân thiện.
                2. Tuyệt đối không tiết lộ ID Hệ Thống.
                """, name, user.getEmail(), user.getId(), name);
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
        // 👉 Tăng PageRequest lên 10 để nhồi đủ trí nhớ ngắn hạn cho AI
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