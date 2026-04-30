package com.haui.ZenBook.chatbot.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private Long sessionId;
    private String reply;
}