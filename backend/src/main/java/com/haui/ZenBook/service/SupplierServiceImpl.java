package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;
import com.haui.ZenBook.entity.SupplierEntity;
import com.haui.ZenBook.enums.SupplierStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.SupplierMapper;
import com.haui.ZenBook.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierResponse create(SupplierCreationRequest request) {
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (supplierRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED, request.getEmail());
            }
        }

        if (request.getTaxCode() != null && !request.getTaxCode().trim().isEmpty()) {
            if (supplierRepository.existsByTaxCode(request.getTaxCode())) {
                throw new AppException(ErrorCode.SUPPLIER_TAX_CODE_EXISTED, request.getTaxCode());
            }
        }

        SupplierEntity newSupplier = supplierMapper.toEntity(request);
        newSupplier.setStatus(SupplierStatus.ACTIVE);
        SupplierEntity savedSupplier = supplierRepository.save(newSupplier);
        return supplierMapper.toResponse(savedSupplier);
    }

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findByStatusNot(SupplierStatus.DELETED).stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    public SupplierResponse getSupplierById(String id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierResponse updateSupplier(String id, SupplierUpdateRequest request) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));

        String newEmail = request.getEmail();
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(supplier.getEmail())) {
            if (supplierRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED, newEmail);
            }
        }

        String newTaxCode = request.getTaxCode();
        if (newTaxCode != null && !newTaxCode.trim().isEmpty() && !newTaxCode.equals(supplier.getTaxCode())) {
            if (supplierRepository.existsByTaxCode(newTaxCode)) {
                throw new AppException(ErrorCode.SUPPLIER_TAX_CODE_EXISTED, newTaxCode);
            }
        }

        supplierMapper.updateSupplier(supplier, request);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void softDeleteSupplier(String id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));

        supplier.setDeletedAt(LocalDateTime.now());
        supplier.setStatus(SupplierStatus.DELETED);
        supplierRepository.save(supplier);
    }

    @Override
    public void hardDeleteSupplier(String id) {
        if (!supplierRepository.existsById(id)) {
            throw new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id);
        }
        supplierRepository.deleteById(id);
    }

    @Override
    public List<SupplierResponse> getAllSuppliersSD() {
        return supplierRepository.findByStatus(SupplierStatus.DELETED).stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    public void restoreSupplier(String id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));

        if (supplier.getDeletedAt() == null) {
            throw new RuntimeException("Nhà cung cấp này không nằm trong thùng rác!");
        }

        supplier.setDeletedAt(null);
        supplier.setStatus(SupplierStatus.ACTIVE);
        supplierRepository.save(supplier);
    }
}