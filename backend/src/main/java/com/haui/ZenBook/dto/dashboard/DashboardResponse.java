package com.haui.ZenBook.dto.dashboard;

import com.haui.ZenBook.dto.dashboard.Metrics.DashboardMetrics;
import com.haui.ZenBook.dto.dashboard.Revenue.CategoryStatDto;
import com.haui.ZenBook.dto.dashboard.Revenue.MonthlyRevenueDto;
import lombok.*;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private DashboardMetrics metrics;           // 4 Card trên cùng
    private List<MonthlyRevenueDto> revenueData; // Biểu đồ doanh thu
    private List<CategoryStatDto> categoryData;  // Danh mục bán chạy
    private List<TopBookDto> topBooks;           // Sách bán chạy
    private List<RecentOrderDto> recentOrders;   // Đơn hàng gần đây
    private List<StockAlertDto> alerts;          // Cảnh báo tồn kho
    private TodayStatsDto todayStats;            // Thống kê hôm nay
}