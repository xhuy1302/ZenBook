package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReceiptDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReceiptDetailRepository extends JpaRepository<ReceiptDetailEntity, String> {

    // Lấy giá nhập của phiếu nhập kho MỚI NHẤT và ĐÃ ĐƯỢC DUYỆT (COMPLETED)
    @Query(value = "SELECT rd.importPrice FROM receipt_details rd " +
            "JOIN receipts r ON rd.receipt_id = r.id " +
            "WHERE rd.book_id = :bookId AND r.status = 'COMPLETED' " + // Chỉ tính phiếu đã nhập kho thành công
            "ORDER BY r.created_at DESC LIMIT 1",
            nativeQuery = true)
    Double getLatestImportPriceByBookId(@Param("bookId") String bookId);
}