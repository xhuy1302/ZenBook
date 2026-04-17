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

    // Bạn có thể trả về một DTO sách rút gọn (ID, Tên, Ảnh) thay vì trả cả BookResponse khổng lồ
    private List<PromotionBookDto> books;

    @Data
    public static class PromotionBookDto {
        private String id;
        private String title;
        private String thumbnail;
        private Double originalPrice;
        private Double salePrice;
    }
}