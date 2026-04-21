package com.haui.ZenBook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@SuperBuilder // Dùng SuperBuilder vì extends BaseEntity
@NoArgsConstructor
@AllArgsConstructor
public class AddressEntity extends BaseEntity {

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "street", nullable = false, length = 255)
    private String street;

    @Column(name = "ward", nullable = false, length = 100)
    private String ward;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "is_default")
    @Builder.Default
    private boolean isDefault = false;

    // ==========================================
    // 👉 QUAN HỆ MANY-TO-ONE VỀ PHÍA USER
    // ==========================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}