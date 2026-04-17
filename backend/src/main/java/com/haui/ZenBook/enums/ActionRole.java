package com.haui.ZenBook.enums;

public enum ActionRole {
    USER,       // Tương ứng với 'user' (Khách hàng tự thao tác)
    STAFF,      // Tương ứng với 'staff' (Nhân viên kho/sale thao tác đơn)
    ADMIN,      // Tương ứng với 'admin' (Quản lý cấp cao thao tác)
    SYSTEM      // Vẫn giữ lại cho các Job chạy ngầm (Auto-cancel, Webhook)
}