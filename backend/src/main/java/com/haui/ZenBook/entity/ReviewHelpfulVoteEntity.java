package com.haui.ZenBook.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "review_helpful_votes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"review_id", "user_id"}, name = "uk_review_user_vote")
        }
)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewHelpfulVoteEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private ReviewEntity review;

    // Người dùng đã nhấn nút "Hữu ích"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}