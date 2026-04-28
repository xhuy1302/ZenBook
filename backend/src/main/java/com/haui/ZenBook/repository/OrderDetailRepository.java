package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.OrderDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity, String> {

    // Top 5 sách bán chạy (tính theo số lượng bán ra)
    // Sửa: Lấy tên tác giả bằng GROUP_CONCAT vì quan hệ N-N
    @Query(value = "SELECT b.id, b.title, " +
            "(SELECT GROUP_CONCAT(a.name SEPARATOR ', ') FROM authors a JOIN book_authors ba ON a.id = ba.author_id WHERE ba.book_id = b.id) as author, " +
            "SUM(od.quantity) as sold, SUM(od.sub_total) as rev, b.stock_quantity as stock " +
            "FROM order_details od " +
            "JOIN orders o ON od.order_id = o.id " +
            "JOIN books b ON od.book_id = b.id " +
            "WHERE o.status = 'COMPLETED' " +
            "GROUP BY b.id, b.title, b.stock_quantity " +
            "ORDER BY sold DESC LIMIT 5", nativeQuery = true)
    List<Object[]> getTopSellingBooks();

    // Phân bổ danh mục (Để tính %)
    // Sửa: Đổi c.category_mame thành c.category_name
    @Query(value = "SELECT c.category_name, SUM(od.quantity) as total_qty " +
            "FROM order_details od " +
            "JOIN books b ON od.book_id = b.id " +
            "JOIN book_categories bc ON b.id = bc.book_id " +
            "JOIN categories c ON bc.category_id = c.id " +
            "JOIN orders o ON od.order_id = o.id " +
            "WHERE o.status = 'COMPLETED' " +
            "GROUP BY c.id, c.category_name " +
            "ORDER BY total_qty DESC", nativeQuery = true)
    List<Object[]> getSalesByCategory();

    // Đếm tổng số sách đã bán trong khoảng thời gian
    @Query("SELECT SUM(od.quantity) FROM OrderDetailEntity od JOIN od.order o WHERE o.createdAt BETWEEN :start AND :end AND o.status = 'COMPLETED'")
    Long countBooksSoldBetween(LocalDateTime start, LocalDateTime end);
}