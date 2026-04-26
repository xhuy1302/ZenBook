package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReviewDetailResponse {
    private String id;
    private Integer rating;
    private String title;
    private String content;
    private ReviewStatus status;
    private Boolean isVerifiedPurchase;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Số lượt được người khác nhấn "Hữu ích"
    private Integer helpfulVotesCount;

    private UserInfo user;
    private BookInfo book;

    // Danh sách ảnh đính kèm
    private List<ImageInfo> images;

    // Lời phản hồi của Admin/Staff (Nếu có)
    private ReplyInfo reply;

    // --- Các lớp Nested tĩnh để nhóm dữ liệu cho gọn ---

    @Data
    @Builder
    public static class UserInfo {
        private String id;
        private String fullName;
        private String email;
        private String avatar;
    }

    @Data
    @Builder
    public static class BookInfo {
        private String id;
        private String title;
        private String slug;
        private String thumbnail;
    }

    @Data
    @Builder
    public static class ImageInfo {
        private String id;
        private String imageUrl;
    }

    @Data
    @Builder
    public static class ReplyInfo {
        private String id;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private ReplyUserInfo repliedBy; // Người đã trả lời
    }

    @Data
    @Builder
    public static class ReplyUserInfo {
        private String id;
        private String fullName;
        // Có thể thêm role: "ADMIN" hoặc "STAFF" để UI hiển thị tag
    }
}