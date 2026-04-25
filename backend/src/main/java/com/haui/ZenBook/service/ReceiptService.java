package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.receipt.PreviewReceiptResponse;
import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface ReceiptService {

    List<ReceiptResponse> getAllReceipts(LocalDate startDate, LocalDate endDate);

    // 👉 Đã thêm tham số `note` để tùy chỉnh ghi chú khi import Excel
    void importReceiptFromExcel(MultipartFile file, String supplierId, String note);

    ReceiptResponse getReceiptById(String id);

    ReceiptResponse createReceipt(ReceiptRequest request);

    ReceiptResponse completeReceipt(String receiptId);

    ReceiptResponse cancelReceipt(String receiptId);

    PreviewReceiptResponse previewImportFromExcel(MultipartFile file);

}