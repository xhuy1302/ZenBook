package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.dashboard.DashboardResponse;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.mapper.OrderMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.CategoryRepository;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getSummary() {
        log.info("Đang tính toán dữ liệu tổng quan cho Dashboard...");

        // 1. Tính toán 4 chỉ số vàng
        Double totalRevenue = orderRepository.sumTotalRevenue();
        long newOrdersCount = orderRepository.countNewOrders();
        long totalCustomers = userRepository.count();

        double finalRevenue = (totalRevenue != null) ? totalRevenue : 0.0;

        // =========================================================
        // 👉 XỬ LÝ SÁCH SẮP HẾT (LOW STOCK)
        // =========================================================
        // Lấy danh sách Entity sách sắp hết từ Database (Dưới 5 quyển)
        List<BookEntity> lowStockEntities = bookRepository
                .findByStockQuantityLessThanAndDeletedAtIsNullOrderByStockQuantityAsc(5);

        // Map sang DTO
        List<DashboardResponse.LowStockBookDto> lowStockBooks = lowStockEntities.stream()
                .map(book -> DashboardResponse.LowStockBookDto.builder()
                        .id(book.getId())
                        .title(book.getTitle())
                        .stockQuantity(book.getStockQuantity())
                        .build())
                .toList();

        // Đếm số lượng để gán cho thẻ chỉ số
        long lowStockCount = lowStockEntities.size();

        // =========================================================
        // 2. Map dữ liệu Doanh thu từ Object[] sang DTO
        // =========================================================
        List<Object[]> rawRevenue = orderRepository.getMonthlyRevenueRaw();
        List<DashboardResponse.RevenueChartData> revenueChart = rawRevenue.stream().map(row -> {
            String month = (String) row[0];
            Double rev = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            Double profit = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            return new DashboardResponse.RevenueChartData(month, rev, profit);
        }).toList();

        // =========================================================
        // 3. Map dữ liệu Danh mục từ Object[] sang DTO + Gắn màu
        // =========================================================
        List<Object[]> rawCategories = categoryRepository.getSalesByCategoryRaw();
        List<DashboardResponse.CategoryChartData> categoryChart = new ArrayList<>();

        String[] chartColors = {
                "var(--color-literature)",
                "var(--color-skills)",
                "var(--color-comics)",
                "var(--color-economy)",
                "var(--color-other)"
        };

        for (int i = 0; i < rawCategories.size(); i++) {
            Object[] row = rawCategories.get(i);
            String catName = (String) row[0];
            Long sales = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            String fillColor = chartColors[i % chartColors.length];

            categoryChart.add(new DashboardResponse.CategoryChartData(catName, sales, fillColor));
        }

        // =========================================================
        // MAP VISITOR CHART
        // =========================================================
        java.util.Map<String, DashboardResponse.VisitorChartData> visitorMap = new java.util.LinkedHashMap<>();

        List<Object[]> newUsers = userRepository.getNewUsersByMonthRaw();
        for (Object[] row : newUsers) {
            String month = (String) row[0];
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            visitorMap.put(month, new DashboardResponse.VisitorChartData(month, count, 0L));
        }

        List<Object[]> activeUsers = orderRepository.getActiveCustomersByMonthRaw();
        for (Object[] row : activeUsers) {
            String month = (String) row[0];
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;

            DashboardResponse.VisitorChartData vData = visitorMap.getOrDefault(month,
                    new DashboardResponse.VisitorChartData(month, 0L, 0L));
            vData.setReturningVisitors(count);
            visitorMap.put(month, vData);
        }
        List<DashboardResponse.VisitorChartData> visitorChart = new ArrayList<>(visitorMap.values());

        // 4. Lấy 5 đơn hàng mới nhất
        List<OrderResponse> recentOrders = orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by("createdAt").descending())
        ).getContent().stream().map(orderMapper::toOrderResponse).toList();

        // 5. Đóng gói và trả về
        return DashboardResponse.builder()
                .totalRevenue(finalRevenue)
                .newOrdersCount(newOrdersCount)
                .totalCustomers(totalCustomers)
                .lowStockCount(lowStockCount)
                .lowStockBooks(lowStockBooks) // 👉 Trả mảng dữ liệu sách sắp hết về cho Frontend
                .revenueChart(revenueChart)
                .categoryChart(categoryChart)
                .visitorChart(visitorChart)
                .recentOrders(recentOrders)
                .build();
    }
}