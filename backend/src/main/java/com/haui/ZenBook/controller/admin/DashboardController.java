package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.dashboard.DashboardResponse;
import com.haui.ZenBook.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // API này chỉ dành cho Admin hoặc Staff
    @GetMapping("/summary")
    public ResponseEntity<DashboardResponse> getDashboardSummary() {
        log.info("Client đang request dữ liệu Dashboard Summary");
        DashboardResponse response = dashboardService.getSummary();
        return ResponseEntity.ok(response);
    }
}