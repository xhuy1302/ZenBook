package com.haui.ZenBook.dto.coupon;

import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.DiscountType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CouponResponse {
    private String id;
    private String code;
    private DiscountType discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minOrderValue;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer maxUsagePerUser;
    private String userId;
    private String categoryId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private CouponStatus status;
    private Double calculatedDiscount; // Trả về số tiền thực tế được giảm khi Validate
}