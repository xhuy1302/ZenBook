package com.haui.ZenBook.dto.coupon;

import com.haui.ZenBook.enums.CouponType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CouponValidateRequest {

    @NotBlank(message = "{validation.coupon.code.not_blank}")
    private String code;

    @NotNull(message = "{validation.coupon.order_total.not_null}")
    @Min(value = 0, message = "{validation.coupon.order_total.min}")
    private Double orderTotal;

    @NotNull(message = "{validation.coupon.type.not_null}")
    private CouponType couponType; // Bắt buộc gửi lên để biết đang áp dụng cho phí ship hay tiền sách

    // Danh sách ID danh mục của các sách trong giỏ hàng (Dùng để check điều kiện mã theo danh mục)
    private List<String> categoryIdsInCart;
}