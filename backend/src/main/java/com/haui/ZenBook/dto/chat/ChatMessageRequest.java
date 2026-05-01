package com.haui.ZenBook.dto.chat;

import com.haui.ZenBook.enums.MessageType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatMessageRequest {
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType messageType;
    private boolean isAdmin;
}