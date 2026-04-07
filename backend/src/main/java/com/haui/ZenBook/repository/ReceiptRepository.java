package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<ReceiptEntity, String> {

    /**
     * 1. Lọc theo khoảng thời gian (Dùng Method Name - Rất nhanh và chuẩn)
     * Hàm này khớp 100% với logic trong ReceiptServiceImpl tôi gửi lúc nãy.
     */
    List<ReceiptEntity> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    /**
     * 2. Hàm lọc tùy biến (Cưng đã viết - Giữ lại để dùng nếu cần logic phức tạp hơn)
     */
    @Query("SELECT r FROM ReceiptEntity r WHERE " +
            "(:startDate IS NULL OR r.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR r.createdAt <= :endDate) " +
            "ORDER BY r.createdAt DESC")
    List<ReceiptEntity> findByDateFilter(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * 3. Đếm số lượng phiếu trong ngày để sinh mã tự động (PN-YYYYMMDD-XXX)
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * 4. Tìm kiếm theo mã phiếu
     */
    Optional<ReceiptEntity> findByReceiptCode(String receiptCode);
}