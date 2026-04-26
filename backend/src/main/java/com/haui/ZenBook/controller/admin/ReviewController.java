package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.review.ReviewFilterRequest;
import com.haui.ZenBook.dto.review.ReviewReplyRequest;
import com.haui.ZenBook.dto.review.UpdateReviewStatusRequest;
import com.haui.ZenBook.dto.review.ReviewDetailResponse;
import com.haui.ZenBook.dto.review.ReviewReplyResponse;
import com.haui.ZenBook.dto.review.ReviewSummaryResponse;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.service.ReviewService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final MessageUtil messageUtil;

    // 1. Lấy danh sách đánh giá (Có lọc & Phân trang)
    // Dùng @ModelAttribute để map query params trên URL vào DTO
    @GetMapping
    public ApiResponse<Page<ReviewSummaryResponse>> getReviews(
            @ModelAttribute ReviewFilterRequest filter,
            Pageable pageable) {

        return ApiResponse.<Page<ReviewSummaryResponse>>builder()
                .data(reviewService.getAdminReviews(filter, pageable))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // 2. Lấy chi tiết 1 bài đánh giá
    @GetMapping("/{reviewId}")
    public ApiResponse<ReviewDetailResponse> getReviewDetail(@PathVariable String reviewId) {
        return ApiResponse.<ReviewDetailResponse>builder()
                .data(reviewService.getReviewDetail(reviewId))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // 3. Cập nhật trạng thái kiểm duyệt (Duyệt/Ẩn/Từ chối)
    @PatchMapping("/{reviewId}/status")
    public ApiResponse<ReviewDetailResponse> updateStatus(
            @PathVariable String reviewId,
            @Valid @RequestBody UpdateReviewStatusRequest request) {

        return ApiResponse.<ReviewDetailResponse>builder()
                .data(reviewService.updateReviewStatus(reviewId, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 4. Admin/Staff trả lời bài đánh giá
    @PostMapping("/{reviewId}/replies")
    public ApiResponse<ReviewReplyResponse> replyToReview(
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewReplyRequest request,
            Authentication authentication) {

        // Lấy thông tin User đang đăng nhập từ Security Context
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();

        return ApiResponse.<ReviewReplyResponse>builder()
                .data(reviewService.replyToReview(reviewId, request, currentUser.getId()))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 5. Cập nhật câu trả lời
    @PutMapping("/replies/{replyId}")
    public ApiResponse<ReviewReplyResponse> updateReply(
            @PathVariable String replyId,
            @Valid @RequestBody ReviewReplyRequest request) {

        return ApiResponse.<ReviewReplyResponse>builder()
                .data(reviewService.updateReply(replyId, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 6. Xóa câu trả lời
    @DeleteMapping("/replies/{replyId}")
    public ApiResponse<Void> deleteReply(@PathVariable String replyId) {
        reviewService.deleteReply(replyId);

        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }
}