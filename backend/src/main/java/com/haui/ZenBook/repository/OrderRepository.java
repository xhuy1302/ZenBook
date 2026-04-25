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
}