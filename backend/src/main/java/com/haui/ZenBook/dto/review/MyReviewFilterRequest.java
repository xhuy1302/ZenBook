package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import lombok.Data;

@Data
public class MyReviewFilterRequest {
    private ReviewStatus status; // Truyền "APPROVED", "PENDING" hoặc null (Tất cả)
    // Sau này thích thì thêm: private Integer rating;
}