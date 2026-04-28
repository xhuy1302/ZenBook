package com.haui.ZenBook.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecentOrderDto {
    private String id;        // "#ZB-8821"
    private String customer;  // "Nguyễn Minh Anh"
    private String avatar;    // "NM" (Backend cắt chữ cái đầu hoặc Frontend tự xử lý)
    private String time;      // "5 phút trước" (Nên trả về LocalDateTime, Frontend dùng date-fns tính toán sẽ chuẩn hơn)
    private int items;        // 3
    private String total;     // "285,000₫"
    private String status;    // "processing" | "shipped" | "delivered" | "cancelled"
}
