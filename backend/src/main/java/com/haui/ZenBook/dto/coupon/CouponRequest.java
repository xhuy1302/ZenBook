package com.haui.ZenBook.dto.coupon;

import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotNull(message = "Loại giảm giá là bắt buộc")
    private DiscountType discountType;

    @Positive(message = "Giá trị giảm phải lớn hơn 0")
    private Double discountValue;

    private Double maxDiscountAmount;
    private Double minOrderValue;
    private Integer usageLimit;
    private Integer maxUsagePerUser;
    private String userId;
    private String categoryId;

    @NotNull(message = "Ngày bắt đầu là bắt buộc")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc là bắt buộc")
    private LocalDateTime endDate;

    private CouponStatus status;
}