package com.haui.ZenBook.dto.review;

import lombok.Data;

@Data
public class ReviewCustomerFilter {
    private Integer rating;       // null = tất cả
    private Boolean hasImage;     // null = tất cả
    private String sortBy;          // "newest" | "helpful"
}
