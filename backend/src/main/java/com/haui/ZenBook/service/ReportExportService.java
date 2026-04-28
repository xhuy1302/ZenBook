package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.dashboard.DashboardResponse;
import com.haui.ZenBook.dto.dashboard.RecentOrderDto;
import com.haui.ZenBook.dto.dashboard.TopBookDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final DashboardService dashboardService;

    // 👉 THÊM THAM SỐ period
    public byte[] exportDashboardToExcel(String period) throws IOException {
        // 1. Lấy dữ liệu Dashboard hiện tại ĐÃ LỌC theo thời gian
        DashboardResponse data = dashboardService.getDashboardOverview(period);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // --- Sheet 1: Thống kê tổng quan ---
            Sheet sheet1 = workbook.createSheet("Tổng Quan");
            Row headerRow1 = sheet1.createRow(0);
            headerRow1.createCell(0).setCellValue("Chỉ số");
            headerRow1.createCell(1).setCellValue("Giá trị");

            // Cập nhật text cho khớp với filter (tùy chọn cho đẹp)
            String timeLabel = "tháng";
            if ("today".equalsIgnoreCase(period)) timeLabel = "hôm nay";
            else if ("week".equalsIgnoreCase(period)) timeLabel = "tuần";
            else if ("year".equalsIgnoreCase(period)) timeLabel = "năm";

            sheet1.createRow(1).createCell(0).setCellValue("Doanh thu " + timeLabel);
            sheet1.getRow(1).createCell(1).setCellValue(data.getMetrics().getRevenue().getValue());

            sheet1.createRow(2).createCell(0).setCellValue("Tổng đơn hàng");
            sheet1.getRow(2).createCell(1).setCellValue(data.getMetrics().getOrders().getValue());

            sheet1.createRow(3).createCell(0).setCellValue("Sách đã bán");
            sheet1.getRow(3).createCell(1).setCellValue(data.getMetrics().getBooksSold().getValue());

            // --- Sheet 2: Sách Bán Chạy ---
            Sheet sheet2 = workbook.createSheet("Sách Bán Chạy");
            Row headerRow2 = sheet2.createRow(0);
            String[] bookHeaders = {"Top", "Tên Sách", "Tác Giả", "Đã Bán", "Doanh Thu", "Tồn Kho"};
            for (int i = 0; i < bookHeaders.length; i++) {
                headerRow2.createCell(i).setCellValue(bookHeaders[i]);
            }

            int rowIdx = 1;
            for (TopBookDto book : data.getTopBooks()) {
                Row row = sheet2.createRow(rowIdx);
                row.createCell(0).setCellValue(rowIdx);
                row.createCell(1).setCellValue(book.getTitle());
                row.createCell(2).setCellValue(book.getAuthor());
                row.createCell(3).setCellValue(book.getSold());
                row.createCell(4).setCellValue(book.getRevenue());
                row.createCell(5).setCellValue(book.getStock());
                rowIdx++;
            }

            // --- Sheet 3: Đơn Hàng Gần Đây ---
            Sheet sheet3 = workbook.createSheet("Đơn Hàng Gần Đây");
            Row headerRow3 = sheet3.createRow(0);
            String[] orderHeaders = {"Mã Đơn", "Khách Hàng", "Số Lượng", "Tổng Tiền", "Trạng Thái"};
            for (int i = 0; i < orderHeaders.length; i++) {
                headerRow3.createCell(i).setCellValue(orderHeaders[i]);
            }

            rowIdx = 1;
            for (RecentOrderDto order : data.getRecentOrders()) {
                Row row = sheet3.createRow(rowIdx);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getCustomer());
                row.createCell(2).setCellValue(order.getItems());
                row.createCell(3).setCellValue(order.getTotal());
                row.createCell(4).setCellValue(order.getStatus());
                rowIdx++;
            }

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < 6; i++) {
                sheet1.autoSizeColumn(i);
                sheet2.autoSizeColumn(i);
                sheet3.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}