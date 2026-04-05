package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;
import com.haui.ZenBook.service.SupplierService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final MessageUtil messageUtil;
    private final SupplierService supplierService;

    @PostMapping
    public ApiResponse<SupplierResponse> createSupplier(@Valid @RequestBody SupplierCreationRequest request) {
        return ApiResponse.<SupplierResponse>builder()
                .data(supplierService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @GetMapping
    public ApiResponse<List<SupplierResponse>> getAll() {
        return ApiResponse.<List<SupplierResponse>>builder()
                .data(supplierService.getAllSuppliers())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<SupplierResponse> getSupplier(@PathVariable String id) {
        return ApiResponse.<SupplierResponse>builder()
                .data(supplierService.getSupplierById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<SupplierResponse> updateSupplier(
            @PathVariable String id,
            @Valid @RequestBody SupplierUpdateRequest request) {
        return ApiResponse.<SupplierResponse>builder()
                .data(supplierService.updateSupplier(id, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDelete(@PathVariable String id) {
        supplierService.hardDeleteSupplier(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDelete(@PathVariable String id) {
        supplierService.softDeleteSupplier(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<SupplierResponse>> getAllSD() {
        return ApiResponse.<List<SupplierResponse>>builder()
                .data(supplierService.getAllSuppliersSD())
                .build();
    }

    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restore(@PathVariable String id) {
        supplierService.restoreSupplier(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
}