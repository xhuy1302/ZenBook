package com.haui.ZenBook.dto.chat;

import com.haui.ZenBook.enums.MessageStatus;
import com.haui.ZenBook.enums.MessageType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private String id;
    private String roomId;
    private String senderId;
    private String receiverId;
    private String content;
    private MessageType messageType;
    private MessageStatus status;
    private LocalDateTime createdAt;
}