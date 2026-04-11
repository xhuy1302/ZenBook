package com.haui.ZenBook.enums;

public enum OrderStatus {
    PENDING,        // Chờ xử lý
    CONFIRMED,      // Đã xác nhận (Trừ kho lúc này)
    PACKING,        // Đang đóng gói
    SHIPPING,       // Đang giao hàng
    COMPLETED,      // Hoàn thành
    CANCELLED,      // Đã hủy (Trả lại kho nếu đã trừ)
    RETURNED        // Hoàn trả
}