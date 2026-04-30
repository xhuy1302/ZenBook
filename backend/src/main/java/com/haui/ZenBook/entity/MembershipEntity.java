package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.MemberTier;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_memberships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MembershipEntity extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberTier tier = MemberTier.MEMBER;

    @Column(name = "available_points", nullable = false)
    @Builder.Default
    private Integer availablePoints = 0;

    @Column(name = "total_spending", nullable = false)
    @Builder.Default
    private Double totalSpending = 0.0;
}