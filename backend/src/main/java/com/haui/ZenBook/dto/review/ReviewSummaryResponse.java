package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewSummaryResponse {
    private String id;
    private Integer rating;
    private String title;
    private String contentSnippet; // Cắt ngắn nội dung nếu quá dài
    private ReviewStatus status;
    private LocalDateTime createdAt;

    // Thông tin cơ bản của Sách
    private String bookId;
    private String bookTitle;
    private String bookThumbnail;

    // Thông tin cơ bản của Khách hàng
    private String userId;
    private String userFullName;
    private String userAvatar;

    // Cờ báo hiệu review này có ảnh hay không (hiển thị icon trên UI)
    private boolean hasImages;
    // Cờ báo hiệu đã được admin trả lời chưa
    private boolean isReplied;
}