package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.PointTransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "point_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PointHistoryEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PointTransactionType type;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String description;

    @Column(name = "reference_id")
    private String referenceId;

    @Builder.Default
    @Column(name = "streak")
    private Integer streak = 0;
}