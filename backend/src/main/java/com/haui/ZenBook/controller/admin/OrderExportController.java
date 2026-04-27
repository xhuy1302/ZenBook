package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.service.PdfExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class OrderExportController {

    private final PdfExportService pdfExportService;

    @GetMapping("/{id}/export-pdf")
    public void exportPdf(@PathVariable String id, HttpServletResponse response) throws IOException {
        // Lấy mảng byte của PDF từ service
        byte[] pdfBytes = pdfExportService.exportOrderPdf(id);

        // Thiết lập Header bắt buộc để trình duyệt hiểu đây là file PDF nhị phân
        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader("Content-Disposition", "attachment; filename=HoaDon_" + id + ".pdf");
        response.setContentLength(pdfBytes.length);

        // Ghi trực tiếp ra luồng output (Bypass mọi Global Response Wrapper)
        response.getOutputStream().write(pdfBytes);
        response.getOutputStream().flush();
    }
}