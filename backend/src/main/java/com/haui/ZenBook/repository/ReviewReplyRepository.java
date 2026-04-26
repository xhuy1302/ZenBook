package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReviewReplyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReplyEntity, String> {
    // Tìm phản hồi theo ID của bài đánh giá
    Optional<ReviewReplyEntity> findByReviewId(String reviewId);
}