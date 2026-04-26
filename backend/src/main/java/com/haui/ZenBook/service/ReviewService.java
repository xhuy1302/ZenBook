package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.review.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ReviewService {

    // ── ADMIN ─────────────────────────────────────────────────────────
    Page<ReviewSummaryResponse> getAdminReviews(ReviewFilterRequest filter, Pageable pageable);
    ReviewDetailResponse getReviewDetail(String reviewId);
    ReviewDetailResponse updateReviewStatus(String reviewId, UpdateReviewStatusRequest request);
    ReviewReplyResponse replyToReview(String reviewId, ReviewReplyRequest request, String staffUserId);
    ReviewReplyResponse updateReply(String replyId, ReviewReplyRequest request);
    void deleteReply(String replyId);

    // ── CUSTOMER — đọc ────────────────────────────────────────────────

    Page<ReviewResponse> getBookReviews(
            String bookId,
            ReviewCustomerFilter filter,
            Pageable pageable,
            String currentUserId
    );

    RatingStatsResponse getRatingStats(String bookId);

    boolean hasUserReviewedBook(String bookId, String userId);

    // 👉 THÊM MỚI: Lấy danh sách đánh giá của chính User đang đăng nhập
    Page<MyReviewResponse> getMyReviews(String userId, String status, Pageable pageable);

    // ── CUSTOMER — viết ───────────────────────────────────────────────
    ReviewDetailResponse createReview(String bookId, CreateReviewRequest request, String userId);
    ReviewDetailResponse updateReview(String reviewId, UpdateReviewRequest request, String userId);
    void deleteReview(String reviewId, String userId);

    HelpfulVoteResponse toggleHelpfulVote(String reviewId, String userId);

    // ── UPLOAD ────────────────────────────────────────────────────────
    String uploadReviewImage(MultipartFile file);
}