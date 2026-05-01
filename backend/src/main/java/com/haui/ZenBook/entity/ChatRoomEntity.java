package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "chat_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder // Phải dùng SuperBuilder để kế thừa BaseEntity
public class ChatRoomEntity extends BaseEntity {

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "admin_id", length = 36)
    private String adminId; // Nullable chờ Admin tiếp nhận

    // 👉 THÊM TRƯỜNG STATUS DÙNG ENUM
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.OPEN;

    // Liên kết với bảng User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", insertable = false, updatable = false)
    private UserEntity admin;


    // Ghi đè prePersist để set giá trị mặc định cho status nếu quên không set
    @PrePersist
    @Override
    public void prePersist() {
        super.prePersist(); // Vẫn gọi prePersist của BaseEntity để tạo UUID
        if (this.status == null) {
            this.status = RoomStatus.OPEN;
        }
    }
}