package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.entity.CouponEntity;
import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.DiscountType;
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

        if (coupon.getUserId() != null && !coupon.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.COUPON_USER_MISMATCH);
        }

        if (coupon.getCategoryId() != null && (categoryIdsInCart == null || !categoryIdsInCart.contains(coupon.getCategoryId()))) {
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
            if (discount > orderTotal) discount = orderTotal; // Không giảm âm tiền
        }

        CouponResponse response = couponMapper.toResponse(coupon);
        response.setCalculatedDiscount(discount);
        return response;
    }

    // ========================================================
    // 2. ADMIN CRUD LOGIC
    // ========================================================
    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (request.getCode() != null && !request.getCode().isBlank()
                && couponRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new AppException(ErrorCode.COUPON_CODE_EXISTED, request.getCode());
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.COUPON_DATE_INVALID);
        }

        CouponEntity entity = couponMapper.toEntity(request);
        if (entity.getStatus() == null) entity.setStatus(CouponStatus.ACTIVE);
        if (entity.getUsedCount() == null) entity.setUsedCount(0);

        try {
            return couponMapper.toResponse(couponRepository.save(entity));
        } catch (Exception e) {
            log.error("Lỗi lưu mã giảm giá: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(String id, CouponRequest request) {
        CouponEntity entity = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, id));

        if (request.getCode() != null && !request.getCode().isBlank()
                && !request.getCode().equals(entity.getCode())
                && couponRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new AppException(ErrorCode.COUPON_CODE_EXISTED, request.getCode());
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.COUPON_DATE_INVALID);
        }

        couponMapper.updateEntity(request, entity);

        try {
            return couponMapper.toResponse(couponRepository.save(entity));
        } catch (Exception e) {
            log.error("Lỗi cập nhật mã giảm giá: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

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

    // ========================================================
    // 3. TRASH & RESTORE
    // ========================================================
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