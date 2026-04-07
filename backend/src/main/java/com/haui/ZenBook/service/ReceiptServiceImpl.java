package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.receipt.ReceiptDetailRequest;
import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.ReceiptDetailEntity;
import com.haui.ZenBook.entity.ReceiptEntity;
import com.haui.ZenBook.entity.SupplierEntity;
import com.haui.ZenBook.enums.ReceiptStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ReceiptMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.ReceiptRepository;
import com.haui.ZenBook.repository.SupplierRepository;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils; // Thêm cái này để check string cho đẹp
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final SupplierRepository supplierRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReceiptMapper receiptMapper;

    @Override
    public List<ReceiptResponse> getAllReceipts(LocalDate startDate, LocalDate endDate) {
        // 1. Xử lý ngày tháng an toàn (Tránh null/chuỗi rỗng từ frontend)
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.now().plusYears(10);

        return receiptRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end)
                .stream()
                .map(receipt -> {
                    ReceiptResponse response = receiptMapper.toResponse(receipt);

                    // 2. SỬA LỖI: Chỉ tìm user nếu creatorId không null
                    String creatorId = receipt.getCreatorId();
                    if (StringUtils.hasText(creatorId)) {
                        userRepository.findById(creatorId).ifPresent(user -> {
                            response.setCreatorName(user.getFullName());
                        });
                    } else {
                        response.setCreatorName("N/A");
                    }

                    return response;
                })
                .toList();
    }

    @Override
    public ReceiptResponse getReceiptById(String id) {
        ReceiptEntity receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));

        ReceiptResponse response = receiptMapper.toResponse(receipt);

        // 3. SỬA LỖI: Check null creatorId ở đây luôn
        if (StringUtils.hasText(receipt.getCreatorId())) {
            userRepository.findById(receipt.getCreatorId()).ifPresent(user -> {
                response.setCreatorName(user.getFullName());
            });
        }

        return response;
    }

    @Override
    @Transactional
    public ReceiptResponse createReceipt(ReceiptRequest request) {
        // Tự động lấy ID người dùng từ Token
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        SupplierEntity supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        ReceiptEntity receipt = ReceiptEntity.builder()
                .receiptCode(generateReceiptCode())
                .supplier(supplier)
                .note(request.getNote())
                .attachmentUrl(request.getAttachmentUrl())
                .status(ReceiptStatus.DRAFT)
                .creatorId(currentUserId)
                .build();

        List<ReceiptDetailEntity> details = new ArrayList<>();
        double totalAmount = 0.0;

        for (ReceiptDetailRequest detailReq : request.getDetails()) {
            BookEntity book = bookRepository.findById(detailReq.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            double subTotal = detailReq.getQuantity() * detailReq.getImportPrice();
            totalAmount += subTotal;

            details.add(ReceiptDetailEntity.builder()
                    .receipt(receipt)
                    .book(book)
                    .quantity(detailReq.getQuantity())
                    .importPrice(detailReq.getImportPrice())
                    .subTotal(subTotal)
                    .build());
        }

        receipt.setDetails(details);
        receipt.setTotalAmount(totalAmount);

        return receiptMapper.toResponse(receiptRepository.save(receipt));
    }

    @Override
    @Transactional
    public void importReceiptFromExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Map này dùng để nhóm: Key là SupplierID, Value là danh sách sách của Supplier đó
            java.util.Map<String, List<ReceiptDetailRequest>> groupBuySupplier = new java.util.HashMap<>();

            // 1. Duyệt toàn bộ file để nhóm hàng theo Nhà cung cấp
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String bookId = getCellValueAsString(row.getCell(0));
                int qty = (int) row.getCell(1).getNumericCellValue();
                double price = row.getCell(2).getNumericCellValue();
                String supplierId = getCellValueAsString(row.getCell(3));

                if (!StringUtils.hasText(supplierId)) continue;

                // Nếu chưa có Supplier này trong Map thì tạo mới list
                groupBuySupplier.computeIfAbsent(supplierId, k -> new ArrayList<>())
                        .add(ReceiptDetailRequest.builder()
                                .bookId(bookId)
                                .quantity(qty)
                                .importPrice(price)
                                .build());
            }

            // 2. Với mỗi Supplier trong Map, tạo một phiếu nhập riêng biệt
            for (java.util.Map.Entry<String, List<ReceiptDetailRequest>> entry : groupBuySupplier.entrySet()) {
                String sId = entry.getKey();
                List<ReceiptDetailRequest> details = entry.getValue();

                // Kiểm tra xem Supplier có tồn tại trong hệ thống không
                SupplierEntity supplier = supplierRepository.findById(sId)
                        .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

                // Gọi hàm tạo phiếu đã có sẵn
                createReceipt(ReceiptRequest.builder()
                        .supplierId(supplier.getId())
                        .note("Imported (Grouped): " + file.getOriginalFilename())
                        .details(details)
                        .build());
            }

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.EXCEL_IMPORT_FAILED);
        }
    }

    /**
     * Hàm bổ trợ để đọc Cell Excel an toàn (Xử lý cả String và Numeric)
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    @Override
    @Transactional
    public ReceiptResponse completeReceipt(String receiptId) {
        ReceiptEntity receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException(ErrorCode.RECEIPT_NOT_DRAFT);
        }

        for (ReceiptDetailEntity detail : receipt.getDetails()) {
            BookEntity book = detail.getBook();
            int currentStock = (book.getStockQuantity() != null) ? book.getStockQuantity() : 0;
            book.setStockQuantity(currentStock + detail.getQuantity());
            bookRepository.save(book);
        }

        receipt.setStatus(ReceiptStatus.COMPLETED);
        return receiptMapper.toResponse(receiptRepository.save(receipt));
    }

    @Override
    @Transactional
    public ReceiptResponse cancelReceipt(String receiptId) {
        ReceiptEntity receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new AppException(ErrorCode.RECEIPT_NOT_FOUND));

        if (receipt.getStatus() == ReceiptStatus.COMPLETED) {
            throw new AppException(ErrorCode.RECEIPT_CANNOT_CANCEL_COMPLETED);
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        return receiptMapper.toResponse(receiptRepository.save(receipt));
    }

    private String generateReceiptCode() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
        long count = receiptRepository.countByCreatedAtBetween(startOfDay, endOfDay) + 1;
        String dateStr = LocalDate.now().toString().replace("-", "");
        return String.format("PN-%s-%03d", dateStr, count);
    }
}