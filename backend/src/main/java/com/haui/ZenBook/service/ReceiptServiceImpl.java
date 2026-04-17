package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.receipt.ReceiptDetailRequest;
import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PublisherEntity;
import com.haui.ZenBook.entity.ReceiptDetailEntity;
import com.haui.ZenBook.entity.ReceiptEntity;
import com.haui.ZenBook.enums.ReceiptStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ReceiptMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.ReceiptRepository;
import com.haui.ZenBook.repository.PublisherRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final PublisherRepository publisherRepository;
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
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        PublisherEntity publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        ReceiptEntity receipt = ReceiptEntity.builder()
                .receiptCode(generateReceiptCode())
                .publisher(publisher)
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

            // 👉 Đổi tên map để quản lý hàng theo từng Publisher
            Map<String, List<ReceiptDetailRequest>> publisherGroups = new HashMap<>();

            // 1. Duyệt file Excel và nhóm dữ liệu theo PublisherId (Cột index 3)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String bookId = getCellValueAsString(row.getCell(0));
                int qty = (int) row.getCell(1).getNumericCellValue();
                double price = row.getCell(2).getNumericCellValue();
                String publisherId = getCellValueAsString(row.getCell(3));

                if (!StringUtils.hasText(publisherId)) {
                    log.warn("Bỏ qua dòng {} do thiếu PublisherId", i);
                    continue;
                }

                publisherGroups.computeIfAbsent(publisherId, k -> new ArrayList<>())
                        .add(ReceiptDetailRequest.builder()
                                .bookId(bookId)
                                .quantity(qty)
                                .importPrice(price)
                                .build());
            }

            // 2. Tạo phiếu nhập cho từng nhóm Nhà xuất bản
            for (Map.Entry<String, List<ReceiptDetailRequest>> entry : publisherGroups.entrySet()) {
                String pId = entry.getKey();
                List<ReceiptDetailRequest> details = entry.getValue();

                // Kiểm tra sự tồn tại của NXB
                PublisherEntity publisher = publisherRepository.findById(pId)
                        .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, "ID NXB: " + pId));

                // Tạo phiếu nhập thực tế
                createReceipt(ReceiptRequest.builder()
                        .publisherId(publisher.getId())
                        .note("Nhập kho từ Excel (Gộp theo NXB): " + file.getOriginalFilename())
                        .details(details)
                        .build());
            }

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