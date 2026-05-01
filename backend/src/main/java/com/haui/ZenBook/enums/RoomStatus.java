package com.haui.ZenBook.enums;

public enum RoomStatus {
    OPEN,       // Ticket mới tạo, đang chờ xử lý hoặc đang chat
    PENDING,    // Đang chờ khách hàng phản hồi / cung cấp thêm thông tin
    RESOLVED,   // Đã giải quyết xong vấn đề
    CLOSED      // Đóng vĩnh viễn (lưu trữ lịch sử)
}