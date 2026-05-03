package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.dto.coupon.CouponValidateRequest;
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

    // 👉 INJECT NOTIFICATION SERVICE VÀO ĐÂY
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CouponResponse validateCoupon(String code, Double orderTotal, String currentUserId, List<String> categoryIdsInCart) {
        CouponEntity coupon = couponRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, code));

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStatus() == CouponStatus.EXPIRED || now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED_OR_INACTIVE);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_USAGE);
        }

        if (orderTotal < coupon.getMinOrderValue()) {
            throw new AppException(ErrorCode.COUPON_MIN_ORDER_NOT_MET, String.valueOf(coupon.getMinOrderValue()));
        }

        if (coupon.getUserId() != null) {
            if (currentUserId == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn cần đăng nhập để sử dụng mã này.");
            }
            if (!coupon.getUserId().equals(currentUserId)) {
                throw new AppException(ErrorCode.COUPON_USER_MISMATCH);
            }
        }

        if (coupon.getCouponType() == CouponType.ORDER && coupon.getCategoryId() != null
                && (categoryIdsInCart == null || !categoryIdsInCart.contains(coupon.getCategoryId()))) {
            throw new AppException(ErrorCode.COUPON_CATEGORY_MISMATCH);
        }

        long countUsed = orderRepository.countByUserIdAndCouponId(currentUserId, coupon.getId());
        if (countUsed >= coupon.getMaxUsagePerUser()) {
            throw new AppException(ErrorCode.COUPON_USER_LIMIT_EXCEEDED);
        }

        double discount = 0.0;

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

    @Override
    @Transactional(readOnly = true)
    public double calculateDiscount(String code, double targetAmount, double orderTotal, CouponType expectedType) {
        if (code == null || code.isBlank()) return 0;

        CouponEntity coupon = couponRepository.findByCodeAndStatus(code, CouponStatus.ACTIVE).orElse(null);

        if (coupon == null || coupon.getCouponType() != expectedType) return 0;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) return 0;
        if (orderTotal < coupon.getMinOrderValue()) return 0;
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) return 0;

        double discount = 0.0;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = targetAmount * (coupon.getDiscountValue() / 100.0);
        } else {
            discount = coupon.getDiscountValue();
        }

        if (coupon.getMaxDiscountAmount() != null) {
            discount = Math.min(discount, coupon.getMaxDiscountAmount());
        }

        return Math.min(discount, targetAmount);
    }

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
        if (entity.getStatus() == null) entity.setStatus(CouponStatus.ACTIVE);
        if (entity.getUsedCount() == null) entity.setUsedCount(0);

        CouponEntity savedCoupon = couponRepository.save(entity);

        // 👉 CHÈN CODE BẮN THÔNG BÁO Ở ĐÂY:
        // Nếu Admin tạo mã chỉ định riêng cho 1 User cụ thể (userId != null), thì báo cho nó biết!
        if (savedCoupon.getUserId() != null && !savedCoupon.getUserId().isBlank()) {
            try {
                String discountText = savedCoupon.getDiscountType() == DiscountType.PERCENTAGE
                        ? String.format("giảm %s%%", savedCoupon.getDiscountValue().intValue())
                        : String.format("giảm %sđ", String.format("%,.0f", savedCoupon.getDiscountValue()));

                String content = String.format("Bạn vừa nhận được mã %s %s. Áp dụng ngay kẻo lỡ!",
                        savedCoupon.getCode(), discountText);

                notificationService.notifyVoucher(
                        savedCoupon.getUserId(),
                        "Tặng mã giảm giá riêng",
                        content,
                        "/zenbookvip"
                );
            } catch (Exception e) {
                log.error("Lỗi gửi thông báo tặng voucher cho user: {}", savedCoupon.getUserId(), e);
            }
        }

        return couponMapper.toResponse(savedCoupon);
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

    @Override
    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(CouponValidateRequest request, String currentUserId) {
        CouponEntity coupon = couponRepository.findByCodeAndDeletedAtIsNull(request.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, request.getCode()));

        if (coupon.getCouponType() != request.getCouponType()) {
            throw new AppException(ErrorCode.COUPON_TYPE_MISMATCH);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStatus() == CouponStatus.EXPIRED || now.isBefore(coupon.getStartDate()) || now.isAfter(coupon.getEndDate())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED_OR_INACTIVE);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_OUT_OF_USAGE);
        }

        if (request.getOrderTotal() < coupon.getMinOrderValue()) {
            throw new AppException(ErrorCode.COUPON_MIN_ORDER_NOT_MET, String.valueOf(coupon.getMinOrderValue()));
        }

        if (coupon.getUserId() != null) {
            if (currentUserId == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn cần đăng nhập để sử dụng mã này.");
            }
            if (!coupon.getUserId().equals(currentUserId)) {
                throw new AppException(ErrorCode.INVALID_ACTION, "Mã giảm giá này không dành cho tài khoản của bạn.");
            }
        }

        if (coupon.getCouponType() == CouponType.ORDER && coupon.getCategoryId() != null) {
            boolean hasValidCategory = request.getCategoryIdsInCart() != null &&
                    request.getCategoryIdsInCart().contains(coupon.getCategoryId());
            if (!hasValidCategory) {
                throw new AppException(ErrorCode.COUPON_CATEGORY_MISMATCH);
            }
        }

        long countUsed = orderRepository.countByUserIdAndCouponId(currentUserId, coupon.getId());
        if (countUsed >= coupon.getMaxUsagePerUser()) {
            throw new AppException(ErrorCode.COUPON_USER_LIMIT_EXCEEDED);
        }

        double discount = 0.0;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = request.getOrderTotal() * (coupon.getDiscountValue() / 100);
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

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(String id) {
        return couponRepository.findById(id)
                .map(couponMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));
    }

    // Trong file CouponServiceImpl.java

    @Override
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllActiveCoupons(String currentUserId) {
        if (currentUserId == null) {
            return couponRepository.findAllByStatusAndUserIdIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(CouponStatus.ACTIVE)
                    .stream()
                    .map(couponMapper::toResponse)
                    .toList();
        } else {
            // 👉 SỬA LỖI: Lấy mã cá nhân ra và lọc bỏ những mã đã sử dụng hết lượt
            return couponRepository.findAllActiveForUser(currentUserId)
                    .stream()
                    .filter(coupon -> {
                        // Nếu mã không có giới hạn, hoặc số lượt dùng (usedCount) vẫn nhỏ hơn giới hạn (usageLimit) thì giữ lại
                        return coupon.getUsageLimit() == null || coupon.getUsedCount() < coupon.getUsageLimit();
                    })
                    .map(couponMapper::toResponse)
                    .toList();
        }
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