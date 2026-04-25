package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.receipt.PreviewReceiptResponse;
import com.haui.ZenBook.dto.receipt.ReceiptRequest;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import com.haui.ZenBook.service.ReceiptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping
    public ResponseEntity<List<ReceiptResponse>> getAllReceipts(
            @RequestParam(value = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(value = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok(receiptService.getAllReceipts(startDate, endDate));
    }

    // 👉 ĐÃ SỬA: Thêm supplierId và note vào API Import
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> importExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("supplierId") String supplierId,
            @RequestParam(value = "note", required = false) String note) {

        receiptService.importReceiptFromExcel(file, supplierId, note);
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

    @PostMapping(value = "/import-preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PreviewReceiptResponse> previewImport(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(receiptService.previewImportFromExcel(file));
    }
}