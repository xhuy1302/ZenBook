package com.haui.ZenBook.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    private String id;
    private String userId;
    private String adminId; // Có thể null nếu chưa có admin tiếp nhận
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String customerName;
    private String customerEmail;
    private String customerAvatar;
    private String customerTier; // Trả về MEMBER, SILVER, GOLD...

    private long unreadCount;

    private String priority;
    private String status;
}