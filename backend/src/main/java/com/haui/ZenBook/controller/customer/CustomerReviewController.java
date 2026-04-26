package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.review.*;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.service.ReviewService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1") // Chú ý prefix
@RequiredArgsConstructor
public class CustomerReviewController {

    private final ReviewService reviewService; // 👉 Đã sửa thành chữ thường
    private final MessageUtil messageUtil;

    // =====================================
    // API PUBLIC (Danh sách review - Có hỗ trợ User đăng nhập)
    // =====================================

    // Lấy danh sách review của 1 quyển sách
    @GetMapping("/books/{bookId}/reviews")
    public ApiResponse<Page<ReviewResponse>> getBookReviews(
            @PathVariable String bookId,
            @ModelAttribute ReviewCustomerFilter filter, // Nhận query params: ?rating=5&hasImage=true
            Pageable pageable,
            Authentication authentication) {

        // Khách vãng lai chưa đăng nhập -> currentUserId = null
        String currentUserId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserEntity) {
            currentUserId = ((UserEntity) authentication.getPrincipal()).getId();
        }

        return ApiResponse.<Page<ReviewResponse>>builder()
                .data(reviewService.getBookReviews(bookId, filter, pageable, currentUserId))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // =====================================
    // API CẦN ĐĂNG NHẬP (Lấy User từ Token)
    // =====================================

    // Đăng bài đánh giá mới
    @PostMapping("/books/{bookId}/reviews")
    public ApiResponse<ReviewDetailResponse> createReview(
            @PathVariable String bookId,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        return ApiResponse.<ReviewDetailResponse>builder()
                .data(reviewService.createReview(bookId, request, user.getId()))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // Sửa đánh giá
    @PutMapping("/reviews/{reviewId}")
    public ApiResponse<ReviewDetailResponse> updateReview(
            @PathVariable String reviewId,
            @Valid @RequestBody UpdateReviewRequest request,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        return ApiResponse.<ReviewDetailResponse>builder()
                .data(reviewService.updateReview(reviewId, request, user.getId()))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // Xóa đánh giá
    @DeleteMapping("/reviews/{reviewId}")
    public ApiResponse<Void> deleteReview(
            @PathVariable String reviewId,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        reviewService.deleteReview(reviewId, user.getId());
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // Nhấn/Bỏ nhấn "Hữu ích"
    @PostMapping("/reviews/{reviewId}/helpful")
    public ApiResponse<HelpfulVoteResponse> toggleHelpfulVote(
            @PathVariable String reviewId,
            Authentication authentication) {

        UserEntity user = (UserEntity) authentication.getPrincipal();
        // 👉 Đã đổi kiểu trả về thành HelpfulVoteResponse
        return ApiResponse.<HelpfulVoteResponse>builder()
                .data(reviewService.toggleHelpfulVote(reviewId, user.getId()))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // Upload Ảnh/Video lên S3
    @PostMapping(value = "/reviews/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadMedia(@RequestParam("file") MultipartFile file) {
        String mediaUrl = reviewService.uploadReviewImage(file);
        return ApiResponse.<String>builder()
                .data(mediaUrl)
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // =====================================
    // API STATS & TRẠNG THÁI REVIEW
    // =====================================

    // Thống kê điểm số (Cho thanh Breakdown)
    @GetMapping("/books/{bookId}/reviews/stats")
    public ApiResponse<RatingStatsResponse> getRatingStats(@PathVariable String bookId) {
        return ApiResponse.<RatingStatsResponse>builder()
                .data(reviewService.getRatingStats(bookId))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    // Kiểm tra khách hàng đã review sách này chưa
    @GetMapping("/books/{bookId}/reviews/me")
    public ApiResponse<Boolean> hasReviewed(
            @PathVariable String bookId,
            Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return ApiResponse.<Boolean>builder()
                .data(reviewService.hasUserReviewedBook(bookId, user.getId()))
                .message(messageUtil.getMessage("success"))
                .build();
    }

    @GetMapping("/reviews/me")
    public ApiResponse<Page<MyReviewResponse>> getMyReviews(
            @RequestParam(defaultValue = "all") String status,
            Pageable pageable,
            Authentication authentication) {

        // Lấy thông tin user đang đăng nhập (Tùy theo cấu trúc Security của bạn)
        // Ví dụ thông thường:
        String userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserEntity) {
            UserEntity user = (UserEntity) authentication.getPrincipal();
            userId = user.getId();
        } else if (authentication != null) {
            // Nếu bạn lưu userId vào name/username
            userId = authentication.getName();
        }

        Page<MyReviewResponse> myReviews = reviewService.getMyReviews(userId, status, pageable);

        return ApiResponse.<Page<MyReviewResponse>>builder()
                .code(0)
                .message("Thao tác thành công!")
                .data(myReviews)
                .build();
    }
}