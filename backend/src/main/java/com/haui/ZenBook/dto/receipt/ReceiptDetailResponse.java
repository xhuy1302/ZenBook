package com.haui.ZenBook.dto.receipt;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetailResponse {
    private String id;
    private String bookId;
    private String bookTitle; // Lấy thêm tên sách để Frontend dễ hiển thị
    private Integer quantity;
    private Double importPrice;
    private Double subTotal;
}