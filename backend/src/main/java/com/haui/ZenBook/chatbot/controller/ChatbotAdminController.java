package com.haui.ZenBook.chatbot.controller;

import com.haui.ZenBook.chatbot.repository.ChatMessageRepository;
import com.haui.ZenBook.chatbot.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/chatbot")
@RequiredArgsConstructor
public class ChatbotAdminController {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", sessionRepository.count());
        stats.put("totalMessages", messageRepository.count());
        // Sau này có thể query thêm: rate_success, tổng user chat...
        return ResponseEntity.ok(stats);
    }
}