package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface ReceiptService {

    // 1. CẬP NHẬT: Thêm tham số lọc theo ngày
    List<ReceiptResponse> getAllReceipts(LocalDate startDate, LocalDate endDate);

    // 2. MỚI: Thêm phương thức Import từ Excel
    void importReceiptFromExcel(MultipartFile file);

    // Các phương thức cũ giữ nguyên
    ReceiptResponse getReceiptById(String id);

    ReceiptResponse createReceipt(ReceiptRequest request);

    ReceiptResponse completeReceipt(String receiptId);

    ReceiptResponse cancelReceipt(String receiptId);
}