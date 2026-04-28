package com.haui.ZenBook.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopBookDto {
    private String id;
    private String title;
    private String author;
    private int sold;
    private String revenue; // Trả về text cho lẹ VD: "55.3M"
    private int stock;
    private String trend;   // "up" hoặc "down" (So sánh tháng này vs tháng trước)
    private String cover;   // Mã màu hex code (Backend có thể random hoặc cấu hình tĩnh theo thể loại)
}
