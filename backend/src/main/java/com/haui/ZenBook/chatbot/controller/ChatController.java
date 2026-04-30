package com.haui.ZenBook.chatbot.controller;

import com.haui.ZenBook.chatbot.dto.ChatRequest;
import com.haui.ZenBook.chatbot.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @PostMapping(produces = MediaType.TEXT_PLAIN_VALUE) // Dùng TEXT_PLAIN để stream text thuần
    public Flux<String> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return Flux.just("⚠️ Lỗi: Tin nhắn không được để trống");
        }

        return chatService.processChatStream(request)
                // Không cộng thêm "data:" ở đây nữa, trả về text sạch luôn
                .onErrorResume(e -> Flux.just("⚠️ Lỗi kết nối AI: " + e.getMessage()));
    }
}