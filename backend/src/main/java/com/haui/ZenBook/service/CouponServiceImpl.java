package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.entity.CouponEntity;
import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.CouponMapper;
import com.haui.ZenBook.repository.CouponRepository;
import com.haui.ZenBook.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final CouponMapper couponMapper;

    // ========================================================
    // 1. CLIENT LOGIC: VALIDATE MÃ KHI ĐẶT HÀNG
    // ========================================================
    @Override
    @Transactional
    public CouponResponse validateCoupon(String code, Double orderTotal, String currentUserId, List<String> categoryIdsInCart) {
        CouponEntity coupon = couponRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, code));

        // Kiểm tra trạng thái và thời gian
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStatus() == CouponStatus.EXPIRED || now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED_OR_INACTIVE);
        }

        // Kiểm tra giới hạn lượt dùng toàn hệ thống
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_USAGE);
        }

        // Kiểm tra giá trị đơn hàng tối thiểu (Cả mã ship và mã order đều cần cái này)
        if (orderTotal < coupon.getMinOrderValue()) {
            throw new AppException(ErrorCode.COUPON_MIN_ORDER_NOT_MET, String.valueOf(coupon.getMinOrderValue()));
        }

        // Kiểm tra giới hạn theo User (Nếu mã chỉ dành cho 1 người)
        if (coupon.getUserId() != null && !coupon.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.COUPON_USER_MISMATCH);
        }

        // Kiểm tra giới hạn theo Danh mục (Chỉ áp dụng cho mã ORDER)
        if (coupon.getCouponType() == CouponType.ORDER && coupon.getCategoryId() != null
                && (categoryIdsInCart == null || !categoryIdsInCart.contains(coupon.getCategoryId()))) {
            throw new AppException(ErrorCode.COUPON_CATEGORY_MISMATCH);
        }

        // Kiểm tra số lần User này đã dùng mã
        long countUsed = orderRepository.countByUserIdAndCouponId(currentUserId, coupon.getId());
        if (countUsed >= coupon.getMaxUsagePerUser()) {
            throw new AppException(ErrorCode.COUPON_USER_LIMIT_EXCEEDED);
        }

        // Tính toán số tiền giảm dự kiến
        double discount = 0.0;
        // Nếu là mã SHIPPING, giá trị 'target' để tính % sẽ là phí ship (tạm tính mặc định hoặc logic riêng)
        // Tuy nhiên ở bước validate này, ta thường tính dựa trên orderTotal hoặc trả về giá trị cố định
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal * (coupon.getDiscountValue() / 100);
            if (coupon.getMaxDiscountAmount() != null && discount > coupon.getMaxDiscountAmount()) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        CouponResponse response = couponMapper.toResponse(coupon);
        response.setCalculatedDiscount(discount);
        return response;
    }

    // ========================================================
    // 2. TÍNH TOÁN GIẢM GIÁ THỰC TẾ (Dùng trong Checkout/Order)
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public double calculateDiscount(String code, double targetAmount, double orderTotal, CouponType expectedType) {
        if (code == null || code.isBlank()) return 0;

        CouponEntity coupon = couponRepository.findByCodeAndStatus(code, CouponStatus.ACTIVE).orElse(null);

        // Kiểm tra loại mã (Phải khớp giữa mã người dùng nhập và ô nhập mã - Freeship vs Voucher)
        if (coupon == null || coupon.getCouponType() != expectedType) return 0;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) return 0;
        if (orderTotal < coupon.getMinOrderValue()) return 0;
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) return 0;

        double discount = 0.0;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            // Nếu là mã ship, targetAmount sẽ là phí ship. Nếu là mã order, targetAmount là tiền sách.
            discount = targetAmount * (coupon.getDiscountValue() / 100.0);
        } else {
            discount = coupon.getDiscountValue();
        }

        if (coupon.getMaxDiscountAmount() != null) {
            discount = Math.min(discount, coupon.getMaxDiscountAmount());
        }

        return Math.min(discount, targetAmount);
    }

    // ========================================================
    // 3. ADMIN CRUD LOGIC (Đã tích hợp CouponType)
    // ========================================================
    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new AppException(ErrorCode.COUPON_CODE_EXISTED, request.getCode());
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.COUPON_DATE_INVALID);
        }

        CouponEntity entity = couponMapper.toEntity(request);
        // Đảm bảo các giá trị mặc định
        if (entity.getStatus() == null) entity.setStatus(CouponStatus.ACTIVE);
        if (entity.getUsedCount() == null) entity.setUsedCount(0);

        return couponMapper.toResponse(couponRepository.save(entity));
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(String id, CouponRequest request) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));

        if (!request.getCode().equals(entity.getCode())
                && couponRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new AppException(ErrorCode.COUPON_CODE_EXISTED, request.getCode());
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.COUPON_DATE_INVALID);
        }

        // Cập nhật thông tin từ DTO vào Entity (Bao gồm cả couponType)
        couponMapper.updateEntity(request, entity);

        return couponMapper.toResponse(couponRepository.save(entity));
    }

    @Override
    @Transactional
    public void incrementUsedCount(String code) {
        couponRepository.findByCodeForUpdate(code).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                coupon.setStatus(CouponStatus.EXPIRED);
            }
            couponRepository.save(coupon);
        });
    }

    // ========================================================
    // 4. CÁC HÀM HỖ TRỢ KHÁC
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(String id) {
        return couponRepository.findById(id)
                .map(couponMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllActiveCoupons() {
        return couponRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void softDeleteCoupon(String id) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));
        entity.setDeletedAt(LocalDateTime.now());
        entity.setStatus(CouponStatus.EXPIRED);
        couponRepository.save(entity);
    }

    @Override
    @Transactional
    public void restoreCoupon(String id) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));
        if (couponRepository.existsByCodeAndDeletedAtIsNull(entity.getCode())) {
            throw new AppException(ErrorCode.COUPON_RESTORE_FAILED_CODE_EXISTED, entity.getCode());
        }
        entity.setDeletedAt(null);
        entity.setStatus(CouponStatus.ACTIVE);
        couponRepository.save(entity);
    }

    @Override
    @Transactional
    public void hardDeleteCoupon(String id) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));
        couponRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getCouponsInTrash() {
        return couponRepository.findAllByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(couponMapper::toResponse)
                .toList();
    }
}