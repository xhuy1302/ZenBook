package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReviewHelpfulVoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVoteEntity, String> {

    // Kiểm tra xem User đã vote cho Review này chưa (tránh spam)
    boolean existsByReviewIdAndUserId(String reviewId, String userId);

    // Tìm bản ghi vote cụ thể để xóa (khi User bỏ nhấn Hữu ích)
    Optional<ReviewHelpfulVoteEntity> findByReviewIdAndUserId(String reviewId, String userId);

    // Đếm tổng số lượt hữu ích của 1 review
    int countByReviewId(String reviewId);
}