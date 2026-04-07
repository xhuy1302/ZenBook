package com.haui.ZenBook.enums;

public enum ReceiptStatus {
    DRAFT,      // Lưu nháp: Phiếu mới tạo, có thể sửa/xóa chi tiết, CHƯA cộng vào số lượng tồn kho.
    COMPLETED,  // Hoàn thành: Trưởng kho đã chốt, ĐÃ CỘNG số lượng vào kho sách, KHÔNG được sửa/hủy nữa.
    CANCELLED   // Đã hủy: Phiếu tạo sai và bị hủy bỏ (chỉ hủy được khi đang ở trạng thái DRAFT).
}