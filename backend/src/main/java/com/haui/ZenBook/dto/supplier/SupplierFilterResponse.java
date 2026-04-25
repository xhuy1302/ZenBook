package com.haui.ZenBook.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SupplierFilterResponse {
    private String id;
    private String name;
    private Long count; // Thường dùng để đếm số lượng Receipts
}