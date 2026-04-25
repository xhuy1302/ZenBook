package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.SupplierEntity;
import com.haui.ZenBook.enums.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, String> {

    // Lấy danh sách NCC tránh các trạng thái không mong muốn (ví dụ: tránh DELETED)
    List<SupplierEntity> findByStatusNot(SupplierStatus status);

    // Lấy danh sách NCC theo trạng thái (ví dụ: chỉ lấy ACTIVE để hiện lên dropdown nhập kho)
    List<SupplierEntity> findByStatus(SupplierStatus status);

    boolean existsByEmail(String email);

    boolean existsByTaxCode(String taxCode);

    /**
     * Truy vấn thống kê số lượng Phiếu nhập (Receipts) của từng Nhà cung cấp
     * Dùng cho trang quản trị hoặc dashboard
     */
    @Query("SELECT s.name, COUNT(r.id) FROM SupplierEntity s " +
            "LEFT JOIN s.receipts r " +
            "GROUP BY s.id, s.name")
    List<Object[]> countReceiptsBySupplier();
}