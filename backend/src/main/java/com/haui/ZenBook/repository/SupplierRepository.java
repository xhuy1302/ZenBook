package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.SupplierEntity;
import com.haui.ZenBook.enums.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, String> {
    List<SupplierEntity> findByStatusNot(SupplierStatus status);
    List<SupplierEntity> findByStatus(SupplierStatus status);

    boolean existsByEmail(String email);
    boolean existsByTaxCode(String taxCode);
}