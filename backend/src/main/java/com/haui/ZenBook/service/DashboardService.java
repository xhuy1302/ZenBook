package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.dashboard.DashboardResponse;

public interface DashboardService {

    /**
     * Lấy toàn bộ dữ liệu tổng hợp cho trang Dashboard Admin
     */
    DashboardResponse getDashboardOverview(String period);

}