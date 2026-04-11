package com.haui.ZenBook.dto.dashboard;

import com.haui.ZenBook.dto.order.OrderResponse;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // 4 thẻ chỉ số trên cùng
    private Double totalRevenue;
    private Long newOrdersCount;
    private Long totalCustomers;
    private Long lowStockCount;

    // 👉 THÊM DÒNG NÀY: Khai báo mảng chứa danh sách sách sắp hết
    private List<LowStockBookDto> lowStockBooks;

    // Dữ liệu cho biểu đồ
    private List<RevenueChartData> revenueChart;
    private List<CategoryChartData> categoryChart;
    private List<VisitorChartData> visitorChart;

    // Danh sách đơn hàng mới nhất
    private List<OrderResponse> recentOrders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueChartData {
        private String month;
        private Double revenue;
        private Double profit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryChartData {
        private String category;
        private Long sales;
        private String fill;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitorChartData {
        private String month;
        private Long newVisitors;
        private Long returningVisitors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockBookDto {
        private String id;
        private String title;
        private int stockQuantity;
    }
}