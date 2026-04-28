package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.dashboard.DashboardResponse;
import com.haui.ZenBook.service.DashboardService;
import com.haui.ZenBook.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ReportExportService reportExportService;
    /**
     * Lấy toàn bộ dữ liệu tổng quan cho Dashboard Admin.
     * Chỉ người dùng có quyền ROLE_ADMIN mới có thể truy cập.
     */
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DashboardResponse> getDashboardOverview(
            @RequestParam(defaultValue = "month", required = false) String period) {

        // Truyền period xuống Service
        DashboardResponse data = dashboardService.getDashboardOverview(period);

        return ApiResponse.<DashboardResponse>builder()
                .data(data)
                .message("Lấy dữ liệu Dashboard thành công")
                .build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<byte[]> exportDashboardReport(
            @RequestParam(defaultValue = "month", required = false) String period) { // 👉 Nhận param period
        try {
            // Truyền period xuống service
            byte[] excelContent = reportExportService.exportDashboardToExcel(period);

            // Cập nhật tên file Excel để phân biệt thời gian
            String fileName = "ZenBook_Report_" + period + ".xlsx";

            return org.springframework.http.ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName)
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelContent);

        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().build();
        }
    }
}