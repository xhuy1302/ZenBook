package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.receipt.*;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final SupplierRepository supplierRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReceiptMapper receiptMapper;

    @Override
    public List<ReceiptResponse> getAllReceipts(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = (startDate != null) ? startDate.atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end = (endDate != null) ? endDate.atTime(23, 59, 59) : LocalDateTime.now().plusYears(10);

        return receiptRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end)
                .stream()
                .map(receipt -> {
                    ReceiptResponse response = receiptMapper.toResponse(receipt);
                    // Lấy tên người nhập kho để hiển thị lên UI
                    String creatorId = receipt.getCreatorId();
                    if (StringUtils.hasText(creatorId)) {
                        userRepository.findById(creatorId).ifPresent(user -> {
                            response.setCreatorName(user.getFullName());
                        });
                    } else {
                        response.setCreatorName("Hệ thống");
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
        // Map tên người nhập kho
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
        // 👉 TRUY VẾT NGƯỜI NHẬP: Lấy ID của nhân viên đang thao tác thông qua Token đăng nhập
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        SupplierEntity supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        ReceiptEntity receipt = ReceiptEntity.builder()
                .receiptCode(generateReceiptCode())
                .supplier(supplier)
                .note(request.getNote())
                .attachmentUrl(request.getAttachmentUrl())
                .status(ReceiptStatus.DRAFT)
                .creatorId(currentUserId) // 👉 LƯU ID NGƯỜI NHẬP VÀO DATABASE
                .build();

        List<ReceiptDetailEntity> details = new ArrayList<>();
        double totalAmount = 0.0;

        for (ReceiptDetailRequest detailReq : request.getDetails()) {
            BookEntity book = bookRepository.findById(detailReq.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            if (detailReq.getQuantity() == null || detailReq.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_DATA, "Số lượng nhập của sách " + book.getTitle() + " phải lớn hơn 0");
            }
            if (detailReq.getImportPrice() == null || detailReq.getImportPrice() < 0) {
                throw new AppException(ErrorCode.INVALID_DATA, "Giá nhập của sách " + book.getTitle() + " không hợp lệ");
            }

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
    public void importReceiptFromExcel(MultipartFile file, String supplierId, String note) {
        SupplierEntity supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<ReceiptDetailRequest> details = new ArrayList<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String bookId = getCellValueAsString(row.getCell(0));
                if (!StringUtils.hasText(bookId)) continue;

                Cell qtyCell = row.getCell(1);
                Cell priceCell = row.getCell(2);

                if (qtyCell == null || priceCell == null) {
                    throw new AppException(ErrorCode.EXCEL_INVALID_FORMAT, "Thiếu dữ liệu số lượng hoặc giá tại dòng " + (i + 1));
                }

                int qty = (int) qtyCell.getNumericCellValue();
                double price = priceCell.getNumericCellValue();

                if (qty <= 0 || price < 0) {
                    throw new AppException(ErrorCode.EXCEL_INVALID_FORMAT, "Số lượng hoặc giá không hợp lệ tại dòng " + (i + 1));
                }

                details.add(ReceiptDetailRequest.builder()
                        .bookId(bookId)
                        .quantity(qty)
                        .importPrice(price)
                        .build());
            }

            if (details.isEmpty()) {
                throw new AppException(ErrorCode.EXCEL_INVALID_FORMAT, "File Excel trống hoặc không có dữ liệu hợp lệ!");
            }

            // 👉 XỬ LÝ GHI CHÚ (NOTE)
            // Nếu người dùng có nhập note, dùng note đó + đính kèm thông tin import file.
            // Nếu không, tạo ghi chú mặc định.
            String finalNote = StringUtils.hasText(note)
                    ? note + " (Import từ file: " + file.getOriginalFilename() + ")"
                    : "Nhập kho tự động từ Excel. Tên file: " + file.getOriginalFilename();

            // Gọi hàm createReceipt để lưu vào DB (Hàm này tự động gán luôn creatorId)
            createReceipt(ReceiptRequest.builder()
                    .supplierId(supplier.getId())
                    .note(finalNote)
                    .details(details)
                    .build());

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi import Excel: ", e);
            throw new AppException(ErrorCode.EXCEL_IMPORT_FAILED);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
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

        // Cập nhật lại kho
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

    @Override
    @Transactional(readOnly = true)
    public PreviewReceiptResponse previewImportFromExcel(MultipartFile file) {
        List<PreviewReceiptDetailResponse> details = new ArrayList<>();
        double totalAmount = 0.0;
        boolean isValidAll = true;

        // Set để kiểm tra trùng lặp BookId ngay trong file Excel
        Set<String> duplicateChecker = new HashSet<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                List<String> errors = new ArrayList<>();
                PreviewReceiptDetailResponse rowResponse = new PreviewReceiptDetailResponse();
                rowResponse.setRowNumber(i + 1);

                // 1. Đọc Book ID
                String bookId = getCellValueAsString(row.getCell(0));
                rowResponse.setBookId(bookId);

                BookEntity book = null;
                if (!StringUtils.hasText(bookId)) {
                    errors.add("Mã sách không được để trống.");
                } else {
                    // Kiểm tra trùng trong file
                    if (!duplicateChecker.add(bookId)) {
                        errors.add("Mã sách này bị lặp lại trong file Excel.");
                    }
                    // Kiểm tra tồn tại trong DB
                    book = bookRepository.findById(bookId).orElse(null);
                    if (book == null) {
                        errors.add("Sách không tồn tại trên hệ thống.");
                    } else {
                        rowResponse.setBookTitle(book.getTitle());
                        rowResponse.setThumbnail(book.getThumbnail());
                        rowResponse.setSalePrice(book.getSalePrice());
                    }
                }

                // 2. Đọc Số lượng
                Cell qtyCell = row.getCell(1);
                Integer qty = (qtyCell != null && qtyCell.getCellType() == CellType.NUMERIC)
                        ? (int) qtyCell.getNumericCellValue() : null;
                rowResponse.setQuantity(qty);

                if (qty == null || qty <= 0) {
                    errors.add("Số lượng phải là số nguyên dương.");
                }

                // 3. Đọc Giá nhập & So sánh Giá bán
                Cell priceCell = row.getCell(2);
                Double importPrice = (priceCell != null && priceCell.getCellType() == CellType.NUMERIC)
                        ? priceCell.getNumericCellValue() : null;
                rowResponse.setImportPrice(importPrice);

                if (importPrice == null || importPrice < 0) {
                    errors.add("Giá nhập không hợp lệ.");
                } else if (book != null) {
                    // 👉 KIỂM TRA GIÁ NHẬP VS GIÁ BÁN
                    if (importPrice >= book.getSalePrice()) {
                        errors.add(String.format("Giá nhập (%.0f) phải nhỏ hơn giá bán niêm yết (%.0f).",
                                importPrice, book.getSalePrice()));
                    }
                }

                // 4. Tính toán trạng thái dòng
                if (errors.isEmpty()) {
                    double subTotal = qty * importPrice;
                    rowResponse.setSubTotal(subTotal);
                    rowResponse.setValid(true);
                    totalAmount += subTotal;
                } else {
                    rowResponse.setValid(false);
                    rowResponse.setErrorMessages(errors);
                    isValidAll = false; // Chỉ cần 1 dòng lỗi là file không hợp lệ để nhập
                }

                details.add(rowResponse);
            }
        } catch (Exception e) {
            log.error("Lỗi đọc file Excel", e);
            throw new AppException(ErrorCode.EXCEL_IMPORT_FAILED);
        }

        int validRows = (int) details.stream().filter(PreviewReceiptDetailResponse::isValid).count();

        return PreviewReceiptResponse.builder()
                .details(details)
                .totalAmount(totalAmount)
                .totalRows(details.size())
                .validRows(validRows)
                .invalidRows(details.size() - validRows)
                .isValidAll(isValidAll)
                .build();
    }
}