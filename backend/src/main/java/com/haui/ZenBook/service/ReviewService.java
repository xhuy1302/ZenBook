package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.review.ReviewFilterRequest;
import com.haui.ZenBook.dto.review.ReviewReplyRequest;
import com.haui.ZenBook.dto.review.UpdateReviewStatusRequest;
import com.haui.ZenBook.dto.review.ReviewDetailResponse;
import com.haui.ZenBook.dto.review.ReviewReplyResponse;
import com.haui.ZenBook.dto.review.ReviewSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    // --- API Danh sách & Chi tiết ---
    Page<ReviewSummaryResponse> getAdminReviews(ReviewFilterRequest filter, Pageable pageable);

    ReviewDetailResponse getReviewDetail(String reviewId);

    // --- API Kiểm duyệt ---
    ReviewDetailResponse updateReviewStatus(String reviewId, UpdateReviewStatusRequest request);

    // --- API Phản hồi của Staff/Admin ---
    // userId ở đây là ID của tài khoản Admin/Staff đang đăng nhập (lấy từ Security Context ở Controller)
    ReviewReplyResponse replyToReview(String reviewId, ReviewReplyRequest request, String staffUserId);

    ReviewReplyResponse updateReply(String replyId, ReviewReplyRequest request);

    void deleteReply(String replyId);
}