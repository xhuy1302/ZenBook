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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository; // 👉 Inject UserRepository để lấy Context
    private final ChatClient chatClient;

    @Transactional
    public Flux<String> processChatStream(ChatRequest request) {
        ChatSession session = getOrCreateSession(request);
        saveMessage(session, "USER", request.getMessage());
        List<Message> history = loadChatHistory(session.getId());

        // 👉 XÂY DỰNG NGỮ CẢNH NGƯỜI DÙNG (USER CONTEXT)
        String userContext = buildUserContext(request.getUserId());

        StringBuilder fullAiResponse = new StringBuilder();

        return chatClient.prompt()
                // Nạp Context động vào System Prompt cho mỗi lượt chat
                .system(sys -> sys.text(userContext))
                .messages(history)
                // 👉 ĐẢM BẢO TÊN BEAN KHỚP 100% VỚI TOOL CONFIG
                .functions("searchBookTool", "checkOrderTool", "checkCouponTool", "addToCartTool","viewCartTool")
                .stream()
                .content()
                .doOnNext(fullAiResponse::append)
                .doOnComplete(() -> {
                    if (!fullAiResponse.isEmpty()) {
                        saveMessage(session, "ASSISTANT", fullAiResponse.toString());
                    }
                });
    }

    // --- XÂY DỰNG CONTEXT TỰ ĐỘNG ---
    private String buildUserContext(String userId) {
        if (userId == null || userId.equals("GUEST") || userId.isBlank()) {
            return "THÔNG TIN KHÁCH HÀNG: Đây là khách vãng lai (chưa đăng nhập). Hãy xưng hô là 'bạn'. Không thể tra cứu đơn hàng cá nhân.";
        }

        Optional<UserEntity> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();

            // Ưu tiên lấy FullName, nếu không có thì lấy Username, không có nữa thì lấy Email
            String name = user.getFullName();
            if (name == null || name.isBlank()) name = user.getRealUsername();
            if (name == null || name.isBlank()) name = user.getEmail();

            return String.format("""
                THÔNG TIN KHÁCH HÀNG ĐANG CHAT VỚI BẠN (HÃY GHI NHỚ):
                - Tên gọi: %s
                - Email: %s
                - ID Hệ Thống: %s
                
                ⚠️ YÊU CẦU ĐẶC BIỆT:
                1. Hãy xưng hô và gọi khách bằng Tên gọi (%s) thật thân thiện.
                2. TUYỆT ĐỐI KHÔNG đọc mã ID Hệ Thống cho khách nghe. Mã ID này chỉ dùng ngầm để truyền vào các Tool (tra cứu đơn, thêm vào giỏ).
                """, name, user.getEmail(), user.getId(), name);
        }

        return "THÔNG TIN KHÁCH HÀNG: Không tìm thấy thông tin chi tiết, ID là " + userId;
    }

    // --- Helper Methods (Giữ nguyên như cũ) ---
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
        List<ChatMessage> lastMsgs = messageRepository.findLatestMessages(sessionId, PageRequest.of(0, 5)); // Tăng memory lên 15
        Collections.reverse(lastMsgs);
        List<Message> messages = new ArrayList<>();
        for (ChatMessage m : lastMsgs) {
            if ("USER".equals(m.getRole())) messages.add(new UserMessage(m.getContent()));
            else messages.add(new AssistantMessage(m.getContent()));
        }
        return messages;
    }
}