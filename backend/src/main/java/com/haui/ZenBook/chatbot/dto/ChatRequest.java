package com.haui.ZenBook.chatbot.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private Long sessionId; // Có thể null nếu là chat mới
    private String userId;    // Lấy từ Token/Security Context trong thực tế
    private String message;
}