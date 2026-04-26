package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private BookEntity book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @Column(name = "is_verified_purchase")
    @Builder.Default
    private Boolean isVerifiedPurchase = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==========================================
    // QUAN HỆ VỚI CÁC BẢNG VỆ TINH (REVIEW MODULE)
    // ==========================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_detail_id", nullable=false)
    private OrderDetailEntity orderDetail;

    // 1-Nhiều với ReviewImage
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewImageEntity> images = new ArrayList<>();

    // 1-1 với ReviewReply (Mỗi đánh giá chỉ có 1 phản hồi chính thức từ Admin/Staff)
    @OneToOne(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ReviewReplyEntity reply;

    // 1-Nhiều với ReviewHelpfulVote
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewHelpfulVoteEntity> helpfulVotes = new ArrayList<>();

    // ==========================================
    // HELPER METHODS ĐỂ QUẢN LÝ QUAN HỆ HAI CHIỀU
    // ==========================================
    public void addImage(ReviewImageEntity image) {
        images.add(image);
        image.setReview(this);
    }

    public void removeImage(ReviewImageEntity image) {
        images.remove(image);
        image.setReview(null);
    }

    public void addHelpfulVote(ReviewHelpfulVoteEntity vote) {
        helpfulVotes.add(vote);
        vote.setReview(this);
    }

    public void removeHelpfulVote(ReviewHelpfulVoteEntity vote) {
        helpfulVotes.remove(vote);
        vote.setReview(null);
    }

    public void setReplySide(ReviewReplyEntity reply) {
        if (reply == null) {
            if (this.reply != null) {
                this.reply.setReview(null);
            }
        } else {
            reply.setReview(this);
        }
        this.reply = reply;
    }
}