package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import com.haui.ZenBook.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    /**
     * 1. LẤY DANH SÁCH PHIẾU NHẬP
     * Sửa: Đảm bảo Spring không bắt lỗi khi params rỗng
     */
    @GetMapping
    public ResponseEntity<List<ReceiptResponse>> getAllReceipts(
            // Chỉ định rõ tên tham số là "startDate" và "endDate"
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Thêm dòng log này để kiểm tra xem request có vào được đến đây không
        System.out.println(">>> Request nhận được: startDate=" + startDate + ", endDate=" + endDate);

        return ResponseEntity.ok(receiptService.getAllReceipts(startDate, endDate));
    }

    /**
     * 2. IMPORT PHIẾU NHẬP TỪ EXCEL
     */
    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<Void> importExcel(@RequestParam("file") MultipartFile file) {
        receiptService.importReceiptFromExcel(file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptResponse> getReceiptById(@PathVariable String id) {
        return ResponseEntity.ok(receiptService.getReceiptById(id));
    }

    @PostMapping
    public ResponseEntity<ReceiptResponse> createReceipt(@RequestBody @Valid ReceiptRequest request) {
        return ResponseEntity.ok(receiptService.createReceipt(request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ReceiptResponse> completeReceipt(@PathVariable String id) {
        return ResponseEntity.ok(receiptService.completeReceipt(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ReceiptResponse> cancelReceipt(@PathVariable String id) {
        return ResponseEntity.ok(receiptService.cancelReceipt(id));
    }
}