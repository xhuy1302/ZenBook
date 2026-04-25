package com.haui.ZenBook.enums;

public enum SupplierStatus {
    ACTIVE,    // Đang hợp tác, cho phép tạo Phiếu nhập kho (Receipt)
    INACTIVE,  // Tạm dừng hợp tác, không cho phép tạo thêm Phiếu nhập mới
    BLOCKED,   // Bị chặn (do vi phạm hợp đồng, hàng kém chất lượng, công nợ quá hạn...)
    DELETED    // Đã xóa khỏi danh sách quản lý
}