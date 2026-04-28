package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.dashboard.*;
import com.haui.ZenBook.dto.dashboard.Metrics.DashboardMetrics;
import com.haui.ZenBook.dto.dashboard.Metrics.MetricItem;
import com.haui.ZenBook.dto.dashboard.Revenue.CategoryStatDto;
import com.haui.ZenBook.dto.dashboard.Revenue.MonthlyRevenueDto;
import com.haui.ZenBook.repository.*;
import com.haui.ZenBook.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    private static final List<String> COLORS = Arrays.asList("#1a4d2e", "#4a2000", "#1a2a4a", "#3d1a00", "#1a3a3a");

    @Override
    public DashboardResponse getDashboardOverview(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime lastStart;
        LocalDateTime lastEnd;

        // Xử lý bộ lọc mốc thời gian
        switch (period != null ? period.toLowerCase() : "month") {
            case "today":
                start = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
                lastStart = start.minusDays(1);
                lastEnd = start.minusNanos(1); // 23:59:59 hôm qua
                break;
            case "week":
                // Lấy ngày đầu tuần (Thứ 2)
                start = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                        .withHour(0).withMinute(0).withSecond(0).withNano(0);
                lastStart = start.minusWeeks(1);
                lastEnd = start.minusNanos(1);
                break;
            case "year":
                start = now.withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                lastStart = start.minusYears(1);
                lastEnd = start.minusNanos(1);
                break;
            case "month":
            default:
                start = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
                lastStart = start.minusMonths(1);
                lastEnd = start.minusNanos(1);
                break;
        }

        // Mốc thời gian riêng cho thẻ "Hôm nay" (cột bên phải giao diện)
        LocalDateTime startOfToday = now.withHour(0).withMinute(0).withSecond(0).withNano(0);

        return DashboardResponse.builder()
                .metrics(calculateMetrics(start, lastStart, lastEnd, now))
                .revenueData(getDynamicChartData(period)) // 👉 Sửa chỗ này thành hàm mới
                .categoryData(getCategoryData())
                .topBooks(getTopBooks())
                .recentOrders(getRecentOrders(now))
                .alerts(getStockAlerts())
                .todayStats(getTodayStats(startOfToday, now))
                .build();
    }

    private List<MonthlyRevenueDto> getDynamicChartData(String period) {
        List<Object[]> rawData;
        String prefix = "";

        switch (period.toLowerCase()) {
            case "today":
                rawData = orderRepository.getRevenueByHourToday();
                prefix = ":00"; // VD: 8:00, 9:00
                break;
            case "week":
                rawData = orderRepository.getRevenueByDayThisWeek();
                return rawData.stream().map(obj -> new MonthlyRevenueDto(
                        String.valueOf(obj[0]), // Tên thứ: Monday, Tuesday...
                        ((Number) obj[1]).doubleValue() / 1000000.0,
                        ((Number) obj[2]).intValue()
                )).collect(Collectors.toList());
            case "month":
                rawData = orderRepository.getRevenueByDayThisMonth();
                prefix = "Ngày ";
                break;
            case "year":
            default:
                rawData = orderRepository.getMonthlyRevenue(LocalDate.now().getYear());
                prefix = "T";
                break;
        }

        String finalPrefix = prefix;
        return rawData.stream().map(obj -> new MonthlyRevenueDto(
                finalPrefix + obj[0],
                ((Number) obj[1]).doubleValue() / 1000000.0,
                ((Number) obj[2]).intValue()
        )).collect(Collectors.toList());
    }

    // --- 1. Tính toán 4 thẻ trên cùng ---
    // (Bạn PHẢI copy đè cả hàm này vì tham số truyền vào đã thay đổi để khớp với bộ lọc)
    private DashboardMetrics calculateMetrics(LocalDateTime start, LocalDateTime lastStart, LocalDateTime lastEnd, LocalDateTime now) {
        // Doanh thu
        Double revThisMonth = Optional.ofNullable(orderRepository.sumRevenueBetween(start, now)).orElse(0.0);
        Double revLastMonth = Optional.ofNullable(orderRepository.sumRevenueBetween(lastStart, lastEnd)).orElse(0.0);

        // Đơn hàng
        Long ordersThisMonth = orderRepository.countOrdersBetween(start, now);
        Long ordersLastMonth = orderRepository.countOrdersBetween(lastStart, lastEnd);

        // Sách đã bán
        Long booksThisMonth = Optional.ofNullable(orderDetailRepository.countBooksSoldBetween(start, now)).orElse(0L);
        Long booksLastMonth = Optional.ofNullable(orderDetailRepository.countBooksSoldBetween(lastStart, lastEnd)).orElse(0L);

        // Khách hàng mới
        Long usersThisMonth = userRepository.countNewUsersBetween(start, now);
        Long usersLastMonth = userRepository.countNewUsersBetween(lastStart, lastEnd);

        return DashboardMetrics.builder()
                .revenue(buildMetric(revThisMonth, revLastMonth, " VNĐ", true))
                .orders(buildMetric(ordersThisMonth.doubleValue(), ordersLastMonth.doubleValue(), "", false))
                .booksSold(buildMetric(booksThisMonth.doubleValue(), booksLastMonth.doubleValue(), "", false))
                .newCustomers(buildMetric(usersThisMonth.doubleValue(), usersLastMonth.doubleValue(), "", false))
                .build();
    }

    // --- 1. Tính toán 4 thẻ trên cùng ---
    private DashboardMetrics calculateMetrics(LocalDateTime thisMonth, LocalDateTime lastMonth) {
        // Doanh thu
        Double revThisMonth = Optional.ofNullable(orderRepository.sumRevenueBetween(thisMonth, LocalDateTime.now())).orElse(0.0);
        Double revLastMonth = Optional.ofNullable(orderRepository.sumRevenueBetween(lastMonth, thisMonth)).orElse(0.0);

        // Đơn hàng
        Long ordersThisMonth = orderRepository.countOrdersBetween(thisMonth, LocalDateTime.now());
        Long ordersLastMonth = orderRepository.countOrdersBetween(lastMonth, thisMonth);

        // Sách đã bán
        Long booksThisMonth = Optional.ofNullable(orderDetailRepository.countBooksSoldBetween(thisMonth, LocalDateTime.now())).orElse(0L);
        Long booksLastMonth = Optional.ofNullable(orderDetailRepository.countBooksSoldBetween(lastMonth, thisMonth)).orElse(0L);

        // Khách hàng mới
        Long usersThisMonth = userRepository.countNewUsersBetween(thisMonth, LocalDateTime.now());
        Long usersLastMonth = userRepository.countNewUsersBetween(lastMonth, thisMonth);

        return DashboardMetrics.builder()
                .revenue(buildMetric(revThisMonth, revLastMonth, " VNĐ", true))
                .orders(buildMetric(ordersThisMonth.doubleValue(), ordersLastMonth.doubleValue(), "", false))
                .booksSold(buildMetric(booksThisMonth.doubleValue(), booksLastMonth.doubleValue(), "", false))
                .newCustomers(buildMetric(usersThisMonth.doubleValue(), usersLastMonth.doubleValue(), "", false))
                .build();
    }

    private MetricItem buildMetric(Double current, Double last, String unit, boolean isMoney) {
        double change = (last == 0) ? (current > 0 ? 100 : 0) : ((current - last) / last) * 100;
        String valStr = isMoney ? formatMoneyCompact(current) : String.format("%,.0f", current);

        return MetricItem.builder()
                .value(valStr + unit)
                .change(String.format("%s%.1f%%", change >= 0 ? "+" : "", change))
                .up(change >= 0)
                .build();
    }

    // --- 2. Biểu đồ doanh thu ---
    private List<MonthlyRevenueDto> getRevenueChartData() {
        return orderRepository.getMonthlyRevenue(LocalDate.now().getYear()).stream()
                .map(obj -> new MonthlyRevenueDto(
                        "T" + obj[0],
                        ((Number) obj[1]).doubleValue() / 1000000.0, // Chia 1tr để hiển thị chữ M
                        ((Number) obj[2]).intValue()
                )).collect(Collectors.toList());
    }

    // --- 3. Biểu đồ danh mục (%) ---
    private List<CategoryStatDto> getCategoryData() {
        List<Object[]> rawData = orderDetailRepository.getSalesByCategory();
        double totalQty = rawData.stream().mapToDouble(obj -> ((Number) obj[1]).doubleValue()).sum();

        if (totalQty == 0) return List.of();

        return rawData.stream()
                .limit(5) // Lấy top 5 danh mục
                .map(obj -> {
                    double qty = ((Number) obj[1]).doubleValue();
                    double percentage = (qty / totalQty) * 100;
                    return new CategoryStatDto((String) obj[0], Math.round(percentage * 10.0) / 10.0);
                }).collect(Collectors.toList());
    }

    // --- 4. Sách bán chạy ---
    // --- 4. Sách bán chạy ---
    private List<TopBookDto> getTopBooks() {
        List<Object[]> rawData = orderDetailRepository.getTopSellingBooks();
        int[] colorIdx = {0};

        return rawData.stream().map(obj -> TopBookDto.builder()
                .id(String.valueOf(obj[0])) // 👉 ĐÃ SỬA: Chuyển về String
                .title((String) obj[1])
                .author((String) obj[2])
                .sold(((Number) obj[3]).intValue())
                .revenue(String.format("%.1fM", ((Number) obj[4]).doubleValue() / 1000000.0))
                .stock(((Number) obj[5]).intValue())
                .trend("up")
                .cover(COLORS.get(colorIdx[0]++ % COLORS.size()))
                .build()
        ).collect(Collectors.toList());
    }

    // --- 5. Đơn hàng gần đây ---
    private List<RecentOrderDto> getRecentOrders(LocalDateTime now) {
        return orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(o -> RecentOrderDto.builder()
                        .id(o.getOrderCode()) // Ở React đã có dấu #
                        .customer(o.getCustomerName())
                        .avatar(getAvatarInitials(o.getCustomerName()))
                        .time(getTimeAgo(o.getCreatedAt(), now))
                        .items(o.getDetails() != null ? o.getDetails().size() : 0)
                        .total(String.format("%,.0f₫", o.getFinalTotal()))
                        .status(o.getStatus().name().toLowerCase())
                        .build())
                .collect(Collectors.toList());
    }

    // --- 6. Cảnh báo tồn kho ---
    private List<StockAlertDto> getStockAlerts() {
        return bookRepository.findTop10ByStockQuantityLessThanEqualOrderByStockQuantityAsc(50).stream()
                .map(b -> StockAlertDto.builder()
                        .book(b.getTitle())
                        .stock(b.getStockQuantity())
                        .threshold(50)
                        .build())
                .collect(Collectors.toList());
    }

    // --- 7. Thống kê hôm nay ---
    private TodayStatsDto getTodayStats(LocalDateTime startOfToday, LocalDateTime now) {
        int newOrders = orderRepository.countOrdersBetween(startOfToday, now).intValue();
        int reviews = reviewRepository.countReviewsToday(startOfToday);
        int shipping = orderRepository.countOrdersInShipping();
        // Số visitor mô phỏng (do backend Spring không mặc định track GA)
        int visitors = newOrders * 25 + (int)(Math.random() * 100);

        return TodayStatsDto.builder()
                .newOrders(newOrders)
                .visitors(visitors)
                .reviews(reviews)
                .shipping(shipping)
                .build();
    }

    // =============== HELPER METHODS ===============

    private String formatMoneyCompact(Double n) {
        if (n >= 1000000000) return String.format("%.2f tỷ", n / 1000000000);
        if (n >= 1000000) return String.format("%.1f tr", n / 1000000);
        return String.format("%,.0f", n);
    }

    private String getAvatarInitials(String name) {
        if (name == null || name.isEmpty()) return "ZB";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    private String getTimeAgo(LocalDateTime past, LocalDateTime now) {
        if (past == null) return "";
        Duration duration = Duration.between(past, now);
        long minutes = duration.toMinutes();
        if (minutes < 60) return (minutes == 0 ? 1 : minutes) + " phút trước";
        long hours = duration.toHours();
        if (hours < 24) return hours + " giờ trước";
        return duration.toDays() + " ngày trước";
    }
}