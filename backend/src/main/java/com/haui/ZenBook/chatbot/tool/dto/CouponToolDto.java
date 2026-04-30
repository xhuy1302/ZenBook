package com.haui.ZenBook.chatbot.tool.dto;

public class CouponToolDto {
    // Request: Có thể null nếu user hỏi chung chung "có voucher nào không"
    // Hoặc chứa mã cụ thể nếu user hỏi "Mã TET2026 giảm bao nhiêu"
    public record CouponRequest(String couponCode) {}

    // Response: Trả về chi tiết mã giảm giá cho AI đọc
    public record CouponResponse(String code, Integer discountPercent, Double maxDiscountAmount, String conditionDescription) {}
}