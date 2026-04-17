package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;

import java.util.List;

public interface CouponService {
    // Client
    CouponResponse validateCoupon(String code, Double orderTotal, String currentUserId, List<String> categoryIdsInCart);

    // Admin CRUD
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(String id, CouponRequest request);
    CouponResponse getCouponById(String id);
    List<CouponResponse> getAllActiveCoupons();

    // Admin Trash & Restore
    List<CouponResponse> getCouponsInTrash();
    void softDeleteCoupon(String id);
    void restoreCoupon(String id);
    void hardDeleteCoupon(String id);
}