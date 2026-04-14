package com.haui.ZenBook.enums;

public enum PromotionStatus {
    SCHEDULED, // Sắp diễn ra (Ví dụ: tạo hôm nay nhưng tuần sau mới chạy)
    ACTIVE,    // Đang chạy (Đang giảm giá)
    PAUSED,    // Tạm dừng (Admin chủ động tắt ngang)
    EXPIRED    // Đã kết thúc (Hết hạn)
}
