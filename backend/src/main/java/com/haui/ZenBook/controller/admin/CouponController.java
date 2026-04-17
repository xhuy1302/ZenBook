package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.service.CouponService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final MessageUtil messageUtil;
    private final CouponService couponService;

    // 1. Tạo mới mã giảm giá
    @PostMapping
    public ApiResponse<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ApiResponse.<CouponResponse>builder()
                .data(couponService.createCoupon(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 2. Lấy danh sách toàn bộ mã giảm giá (Active)
    @GetMapping
    public ApiResponse<List<CouponResponse>> getAllActiveCoupons() {
        return ApiResponse.<List<CouponResponse>>builder()
                .data(couponService.getAllActiveCoupons())
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
        // Lưu ý nhỏ: Ở file UserController nãy bạn quên bọc messageUtil.getMessage() ở hàm restore.
        // Mình bọc chuẩn lại ở đây luôn để nó tự dịch ra Tiếng Việt/Anh nhé!
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }

    // ========================================================
    // 9. Dành cho Client: Validate mã giảm giá khi thanh toán
    // ========================================================
    @GetMapping("/validate")
    public ApiResponse<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double orderTotal,
            @RequestParam(required = false) String currentUserId,
            @RequestParam(required = false) List<String> categoryIdsInCart) {

        return ApiResponse.<CouponResponse>builder()
                .data(couponService.validateCoupon(code, orderTotal, currentUserId, categoryIdsInCart))
                .message(messageUtil.getMessage("success"))
                .build();
    }
}