package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierFilterResponse;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;

import java.util.List;

public interface SupplierService {
    SupplierResponse create(SupplierCreationRequest request);
    List<SupplierResponse> getAllSuppliers();
    SupplierResponse getSupplierById(String id);
    SupplierResponse updateSupplier(String id, SupplierUpdateRequest request);
    void softDeleteSupplier(String id);
    void hardDeleteSupplier(String id);
    List<SupplierResponse> getAllSuppliersSD(); // Soft deleted (Thùng rác)
    void restoreSupplier(String id);

    // Thống kê nhà cung cấp cho bộ lọc hoặc dashboard
    List<SupplierFilterResponse> getSuppliersForFilter();
}