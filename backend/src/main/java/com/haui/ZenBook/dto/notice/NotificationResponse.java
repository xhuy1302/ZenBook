package com.haui.ZenBook.dto.notice;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String type;
    private String title;
    private String content;
    private String link;
    private boolean read;   // đổi từ isRead -> read
    private LocalDateTime createdAt;
}