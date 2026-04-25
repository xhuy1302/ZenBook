package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierFilterResponse;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;
import com.haui.ZenBook.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/suppliers") // 👉 Thêm /admin vào để đồng bộ hệ thống
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    // ADMIN và STAFF đều có quyền xem và tạo/sửa để phục vụ nhập kho
    @PostMapping
    public ResponseEntity<SupplierResponse> create(@RequestBody @Valid SupplierCreationRequest request) {
        return ResponseEntity.ok(supplierService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable String id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable String id,
            @RequestBody @Valid SupplierUpdateRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteSupplier(@PathVariable String id) {
        supplierService.softDeleteSupplier(id);
        return ResponseEntity.ok().build();
    }

    // 👉 Chỉ ADMIN mới được xóa vĩnh viễn
    @DeleteMapping("/{id}/hard-delete")
    public ResponseEntity<Void> hardDeleteSupplier(@PathVariable String id) {
        supplierService.hardDeleteSupplier(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trash")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliersSD() {
        return ResponseEntity.ok(supplierService.getAllSuppliersSD());
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restoreSupplier(@PathVariable String id) {
        supplierService.restoreSupplier(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<SupplierFilterResponse>> getSuppliersForFilter() {
        return ResponseEntity.ok(supplierService.getSuppliersForFilter());
    }
}