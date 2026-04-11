package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {

    @Query("SELECT MAX(o.orderCode) FROM OrderEntity o WHERE o.orderCode LIKE %:datePrefix%")
    String findMaxOrderCodeByDate(String datePrefix);

    long countByStatus(OrderStatus status);

    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    Page<OrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrderEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<OrderEntity> findByStatusAndCreatedAtBefore(OrderStatus status, LocalDateTime time);

    @Query("SELECT FUNCTION('MONTHNAME', o.createdAt), COUNT(DISTINCT o.userId) FROM OrderEntity o GROUP BY FUNCTION('MONTHNAME', o.createdAt), FUNCTION('MONTH', o.createdAt) ORDER BY FUNCTION('MONTH', o.createdAt)")
    List<Object[]> getActiveCustomersByMonthRaw();

    @Query("SELECT SUM(o.finalTotal) FROM OrderEntity o WHERE o.status = 'COMPLETED'")
    Double sumTotalRevenue();

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'PENDING'")
    long countNewOrders();


    // 👉 THAY ĐỔI Ở ĐÂY: Trả về List<Object[]>
    @Query("SELECT FUNCTION('MONTHNAME', o.createdAt), SUM(o.finalTotal), SUM(o.finalTotal) * 0.3 " +
            "FROM OrderEntity o WHERE o.status = 'COMPLETED' " +
            "GROUP BY FUNCTION('MONTHNAME', o.createdAt), FUNCTION('MONTH', o.createdAt) " +
            "ORDER BY FUNCTION('MONTH', o.createdAt)")
    List<Object[]> getMonthlyRevenueRaw();

}