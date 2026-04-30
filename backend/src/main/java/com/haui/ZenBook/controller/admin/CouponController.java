package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.entity.UserEntity; // Nhập UserEntity để lấy ID
import com.haui.ZenBook.service.CouponService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication; // Nhập Authentication
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final MessageUtil messageUtil;
    private final CouponService couponService;

    // ========================================================
    // HÀM BỔ SUNG: LẤY UUID CHUẨN TỪ TOKEN
    // ========================================================
    private String getUserIdFromToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null; // Khách vãng lai
        }
        // Ép kiểu Principal về UserEntity (hoặc CustomUserDetails tùy hệ thống của bạn)
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return user.getId();
    }

    // 1. Tạo mới mã giảm giá
    @PostMapping
    public ApiResponse<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .data(couponService.createCoupon(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 2. Lấy danh sách toàn bộ mã giảm giá (Active) - Đã sửa để nhận diện User
    // 2. Lấy danh sách toàn bộ mã giảm giá (Active) - Đón thẳng userId từ Frontend
    @GetMapping
    public ApiResponse<List<CouponResponse>> getAllActiveCoupons(@RequestParam(required = false) String userId) {
        return ApiResponse.<List<CouponResponse>>builder()
                .data(couponService.getAllActiveCoupons(userId))
                .build();
    }

    // 3. Lấy thông tin chi tiết 1 mã giảm giá
    @GetMapping("/{id}")
    public ApiResponse<CouponResponse> getCouponById(@PathVariable String id) {
        return ApiResponse.<CouponResponse>builder()
                .data(couponService.getCouponById(id))
                .build();
    }

    // 4. Cập nhật mã giảm giá
    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> updateCoupon(
            @PathVariable String id,
            @Valid @RequestBody CouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .data(couponService.updateCoupon(id, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 5. Xóa vĩnh viễn mã giảm giá (Hard Delete)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDeleteCoupon(@PathVariable String id) {
        couponService.hardDeleteCoupon(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 6. Xóa mềm mã giảm giá (Cho vào thùng rác)
    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDeleteCoupon(@PathVariable String id) {
        couponService.softDeleteCoupon(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    // 7. Lấy danh sách mã giảm giá trong thùng rác
    @GetMapping("/trash")
    public ApiResponse<List<CouponResponse>> getCouponsInTrash() {
        return ApiResponse.<List<CouponResponse>>builder()
                .data(couponService.getCouponsInTrash())
                .build();
    }

    // 8. Khôi phục mã giảm giá từ thùng rác
    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restoreCoupon(@PathVariable String id) {
        couponService.restoreCoupon(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }


    // 9. Validate mã giảm giá khi thanh toán
    @GetMapping("/validate")
    public ApiResponse<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderTotal,
            @RequestParam(required = false) String currentUserId, // 👉 Đón thẳng ID từ Frontend gửi xuống
            @RequestParam(required = false) List<String> categoryIdsInCart) {

        return ApiResponse.<CouponResponse>builder()
                .data(couponService.validateCoupon(code, orderTotal, currentUserId, categoryIdsInCart))
                .message(messageUtil.getMessage("success"))
                .build();
    }
}