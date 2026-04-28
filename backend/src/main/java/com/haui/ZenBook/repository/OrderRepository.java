package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {


    List<OrderEntity> findAllByUserIdOrderByCreatedAtDesc(String userId);

    long countByStatus(OrderStatus status);

    long countByUserIdAndCouponId(String userId, String couponId);

    Page<OrderEntity> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, OrderStatus status, Pageable pageable);

    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    Page<OrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrderEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<OrderEntity> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime time);

    // 👉 THÊM 2 HÀM NÀY ĐỂ LỌC THEO NGÀY THÁNG
    Page<OrderEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<OrderEntity> findByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime start, LocalDateTime end, Pageable pageable);
    Optional<OrderEntity> findByOrderCode(String orderCode);
    @Query("SELECT MAX(o.orderCode) FROM OrderEntity o WHERE o.orderCode LIKE :prefix%")

    String findMaxOrderCodeByDate(@Param("prefix") String prefix);
    @Query("SELECT FUNCTION('MONTHNAME', o.createdAt), COUNT(DISTINCT o.userId) FROM OrderEntity o GROUP BY FUNCTION('MONTHNAME', o.createdAt), FUNCTION('MONTH', o.createdAt) ORDER BY FUNCTION('MONTH', o.createdAt)")
    List<Object[]> getActiveCustomersByMonthRaw();

    @Query("SELECT SUM(o.finalTotal) FROM OrderEntity o WHERE o.status = 'COMPLETED'")
    Double sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countNewOrders();

    @Query("SELECT FUNCTION('MONTHNAME', o.createdAt), SUM(o.finalTotal), SUM(o.finalTotal) * 0.3 " +
            "FROM OrderEntity o WHERE o.status = 'COMPLETED' " +
            "GROUP BY FUNCTION('MONTHNAME', o.createdAt), FUNCTION('MONTH', o.createdAt) " +
            "ORDER BY FUNCTION('MONTH', o.createdAt)")
    List<Object[]> getMonthlyRevenueRaw();


    // 1. Theo Giờ (Dùng cho "Hôm nay")
    @Query(value = "SELECT HOUR(created_at) as unit, SUM(final_total) as revenue, COUNT(id) as orders " +
            "FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status = 'COMPLETED' " +
            "GROUP BY HOUR(created_at) ORDER BY unit", nativeQuery = true)
    List<Object[]> getRevenueByHourToday();

    // 2. Theo Ngày trong Tuần này
    @Query(value = "SELECT DAYNAME(created_at) as unit, SUM(final_total) as revenue, COUNT(id) as orders " +
            "FROM orders WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) AND status = 'COMPLETED' " +
            "GROUP BY DAYOFWEEK(created_at) ORDER BY DAYOFWEEK(created_at)", nativeQuery = true)
    List<Object[]> getRevenueByDayThisWeek();

    // 3. Theo Ngày trong Tháng này
    @Query(value = "SELECT DAY(created_at) as unit, SUM(final_total) as revenue, COUNT(id) as orders " +
            "FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'COMPLETED' " +
            "GROUP BY DAY(created_at) ORDER BY unit", nativeQuery = true)
    List<Object[]> getRevenueByDayThisMonth();

    // 4. Theo Tháng trong Năm (Cái cũ)
    @Query(value = "SELECT MONTH(created_at) as unit, SUM(final_total) as revenue, COUNT(id) as orders " +
            "FROM orders WHERE YEAR(created_at) = :year AND status = 'COMPLETED' " +
            "GROUP BY MONTH(created_at) ORDER BY unit", nativeQuery = true)
    List<Object[]> getMonthlyRevenue(int year);

    // Tính tổng doanh thu trong khoảng thời gian
    @Query("SELECT SUM(o.finalTotal) FROM OrderEntity o WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'COMPLETED'")
    Double sumRevenueBetween(LocalDateTime start, LocalDateTime end);

    // Đếm số đơn hàng trong khoảng thời gian
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt BETWEEN :start AND :end")
    Long countOrdersBetween(LocalDateTime start, LocalDateTime end);

    // Lấy 5 đơn hàng mới nhất
    List<OrderEntity> findTop5ByOrderByCreatedAtDesc();

    // Đếm đơn hàng đang giao (Hôm nay)
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'SHIPPING'")
    int countOrdersInShipping();

}