package com.haui.ZenBook.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockAlertDto {
    private String book;      // Tên sách
    private int stock;        // Tồn kho hiện tại
    private int threshold;    // Ngưỡng cảnh báo (VD: 50)
}