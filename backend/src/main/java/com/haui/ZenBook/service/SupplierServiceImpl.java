package com.haui.ZenBook.service; // Lưu ý package nếu bạn để trong thư mục impl

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;
import com.haui.ZenBook.entity.SupplierEntity;
import com.haui.ZenBook.enums.SupplierStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.SupplierMapper;
import com.haui.ZenBook.repository.SupplierRepository;
import com.haui.ZenBook.service.SupplierService;
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
        // 1. Kiểm tra Email đã tồn tại chưa (nếu client có gửi email lên)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (supplierRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED);
            }
        }

        // 2. Kiểm tra Mã số thuế đã tồn tại chưa (nếu client có gửi lên)
        if (request.getTaxCode() != null && !request.getTaxCode().trim().isEmpty()) {
            if (supplierRepository.existsByTaxCode(request.getTaxCode())) {
                throw new AppException(ErrorCode.SUPPLIER_TAX_CODE_EXISTED);
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
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierResponse updateSupplier(String id, SupplierUpdateRequest request) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        // 1. Kiểm tra trùng Email (Chỉ kiểm tra nếu người dùng thay đổi Email mới khác Email cũ)
        String newEmail = request.getEmail();
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(supplier.getEmail())) {
            if (supplierRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED);
            }
        }

        // 2. Kiểm tra trùng Mã số thuế (Chỉ kiểm tra nếu thay đổi)
        String newTaxCode = request.getTaxCode();
        if (newTaxCode != null && !newTaxCode.trim().isEmpty() && !newTaxCode.equals(supplier.getTaxCode())) {
            if (supplierRepository.existsByTaxCode(newTaxCode)) {
                throw new AppException(ErrorCode.SUPPLIER_TAX_CODE_EXISTED);
            }
        }

        supplierMapper.updateSupplier(supplier, request);
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void softDeleteSupplier(String id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        supplier.setDeletedAt(LocalDateTime.now());
        supplier.setStatus(SupplierStatus.DELETED);
        supplierRepository.save(supplier);
    }

    @Override
    public void hardDeleteSupplier(String id) {
        if (!supplierRepository.existsById(id)) {
            throw new AppException(ErrorCode.SUPPLIER_NOT_FOUND);
        }

        // Chú ý: Ở hệ thống thực tế, nếu Supplier đã được map với Book hoặc PurchaseOrder,
        // việc hard delete có thể sinh ra lỗi Ràng buộc khóa ngoại (Foreign Key Constraint).
        // Nếu sau này bạn bị lỗi 500 khi xóa cứng, hãy đổi về bắt ErrorCode.SUPPLIER_CANNOT_DELETE.
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
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        // Tránh lỗi nếu tài khoản không nằm trong thùng rác
        if (supplier.getDeletedAt() == null) {
            throw new RuntimeException("Nhà cung cấp này không nằm trong thùng rác!");
        }

        supplier.setDeletedAt(null);
        supplier.setStatus(SupplierStatus.ACTIVE);
        supplierRepository.save(supplier);
    }
}