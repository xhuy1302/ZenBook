package com.haui.ZenBook.dto.dashboard.Metrics;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetrics {
    private MetricItem revenue;      // Doanh thu
    private MetricItem orders;       // Đơn hàng
    private MetricItem booksSold;    // Sách đã bán
    private MetricItem newCustomers; // Khách mới
}


