package com.haui.ZenBook.dto.promotion;

import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.PromotionStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PromotionResponse {
    private String id;
    private String name;
    private String description;
    private DiscountType discountType;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PromotionStatus status;
    private LocalDateTime createdAt;

    private List<PromotionBookDto> books;

    @Data
    public static class PromotionBookDto {
        private String id;
        private String title;
        private String slug;
        private String thumbnail;
        private Double originalPrice;
        private Double salePrice;
        private Integer stockQuantity;

        private Double rating;
        private Integer reviews;

        // 👉 ĐÃ THÊM: Trường này để lưu phần trăm giảm giá gửi cho Frontend hiển thị Badge đỏ
        private Integer discount;

        private List<AuthorDto> authors;
    }

    @Data
    public static class AuthorDto {
        private String id;
        private String name;
    }
}