package com.haui.ZenBook.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TodayStatsDto {
    private int newOrders;    // Đơn hàng mới
    private int visitors;     // Khách ghé thăm (Có thể mock hoặc lấy từ bảng Log)
    private int reviews;      // Đánh giá mới hôm nay
    private int shipping;     // Đơn đang giao (status = SHIPPING)
}
