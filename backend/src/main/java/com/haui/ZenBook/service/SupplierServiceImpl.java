package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierFilterResponse;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    @Transactional
    public SupplierResponse create(SupplierCreationRequest request) {
        // Kiểm tra Email trùng lặp
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (supplierRepository.existsByEmail(request.getEmail())) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED, request.getEmail());
            }
        }

        // Kiểm tra Mã số thuế trùng lặp (Cực kỳ quan trọng với Nhà cung cấp)
        if (request.getTaxCode() != null && !request.getTaxCode().trim().isEmpty()) {
            if (supplierRepository.existsByTaxCode(request.getTaxCode())) {
                throw new AppException(ErrorCode.SUPPLIER_TAX_CODE_EXISTED, request.getTaxCode());
            }
        }

        SupplierEntity newSupplier = supplierMapper.toEntity(request);
        newSupplier.setStatus(SupplierStatus.ACTIVE); // Giả định dùng String hoặc Enum tùy cấu hình Entity của bạn

        return supplierMapper.toResponse(supplierRepository.save(newSupplier));
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
    @Transactional
    public SupplierResponse updateSupplier(String id, SupplierUpdateRequest request) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));

        // Kiểm tra logic trùng email khi cập nhật
        String newEmail = request.getEmail();
        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(supplier.getEmail())) {
            if (supplierRepository.existsByEmail(newEmail)) {
                throw new AppException(ErrorCode.SUPPLIER_EMAIL_EXISTED, newEmail);
            }
        }

        // Kiểm tra logic trùng mã số thuế khi cập nhật
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
    @Transactional
    public void softDeleteSupplier(String id) {
        SupplierEntity supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id));

        supplier.setDeletedAt(LocalDateTime.now());
        supplier.setStatus(SupplierStatus.DELETED);
        supplierRepository.save(supplier);
    }

    @Override
    @Transactional
    public void hardDeleteSupplier(String id) {
        if (!supplierRepository.existsById(id)) {
            throw new AppException(ErrorCode.SUPPLIER_NOT_FOUND, id);
        }
        // Lưu ý: Nếu Supplier đã có Phiếu nhập (Receipt), database sẽ báo lỗi Foreign Key
        supplierRepository.deleteById(id);
    }

    @Override
    public List<SupplierResponse> getAllSuppliersSD() {
        return supplierRepository.findByStatus(SupplierStatus.DELETED).stream()
                .map(supplierMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
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

    @Override
    public List<SupplierFilterResponse> getSuppliersForFilter() {
        // Thực hiện query lấy danh sách NCC và đếm số lượng Receipt (Phiếu nhập)
        List<Object[]> results = supplierRepository.countReceiptsBySupplier();
        return results.stream()
                .map(row -> new SupplierFilterResponse(
                        (String) row[0], // id/name
                        (String) row[1], // name
                        (Long) row[2]    // count
                ))
                .toList();
    }
}