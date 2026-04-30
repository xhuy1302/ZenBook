package com.haui.ZenBook.enums;

import lombok.Getter;

@Getter
public enum RewardPackage {
    VOUCHER_20K(500, 20000.0, DiscountType.FIXED_AMOUNT, CouponType.ORDER, "Voucher giảm 20k"),
    VOUCHER_50K(1000, 50000.0, DiscountType.FIXED_AMOUNT, CouponType.ORDER, "Voucher giảm 50k"),
    VOUCHER_120K(2500, 120000.0, DiscountType.FIXED_AMOUNT, CouponType.ORDER, "Voucher giảm 120k"),
    FREESHIP_VIP(5000, 35000.0, DiscountType.FIXED_AMOUNT, CouponType.SHIPPING, "Miễn phí vận chuyển"); // Giả sử max phí ship là 35k

    private final int requiredPoints;
    private final Double discountValue;
    private final DiscountType discountType;
    private final CouponType couponType;
    private final String description;

    RewardPackage(int requiredPoints, Double discountValue, DiscountType discountType, CouponType couponType, String description) {
        this.requiredPoints = requiredPoints;
        this.discountValue = discountValue;
        this.discountType = discountType;
        this.couponType = couponType;
        this.description = description;
    }

    // Tìm gói quà dựa vào tên string (từ React truyền lên)
    public static RewardPackage fromString(String text) {
        for (RewardPackage b : RewardPackage.values()) {
            if (b.name().equalsIgnoreCase(text)) {
                return b;
            }
        }
        return null;
    }
}