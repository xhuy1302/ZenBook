package com.haui.ZenBook.dto.dashboard.Revenue;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyRevenueDto {
    private String month;   // "T1", "T2"...
    private double revenue; // 42 (Tính theo Triệu)
    private int orders;     // 210
}