package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.dto.coupon.CouponValidateRequest;
import com.haui.ZenBook.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CustomerCouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validateCoupon(
            @Valid @RequestBody CouponValidateRequest request,
            Authentication authentication
    ) {
        String currentUserId = authentication.getName();

        CouponResponse response =
                couponService.validateCoupon(request, currentUserId);

        return ResponseEntity.ok(
                ApiResponse.<CouponResponse>builder()
                        .data(response)
                        .message("Voucher hợp lệ / Voucher applied successfully")
                        .build()
        );
    }
}
