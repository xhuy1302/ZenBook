package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.MessageStatus;
import com.haui.ZenBook.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MessageEntity extends BaseEntity {

    // Thay vì BIGINT, room_id giờ là String (khớp với kiểu ID của BaseEntity)
    @Column(name = "room_id", length = 36, nullable = false)
    private String roomId;

    @Column(name = "sender_id", length = 36, nullable = false)
    private String senderId;

    @Column(name = "receiver_id", length = 36, nullable = false)
    private String receiverId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20, nullable = false)
    private MessageType messageType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private MessageStatus status;

    // Quan hệ ManyToOne với ChatRoom
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private ChatRoomEntity chatRoom;

    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist(); // Gọi prePersist của BaseEntity để tạo UUID
        if (this.status == null) {
            this.status = MessageStatus.SENT;
        }
        if (this.messageType == null) {
            this.messageType = MessageType.TEXT;
        }
    }
}