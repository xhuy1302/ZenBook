package com.haui.ZenBook.dto.receipt;

import com.haui.ZenBook.enums.ReceiptStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponse {
    private String id;
    private String receiptCode;

    // 👉 Đã đổi biến sang supplier
    private String supplierId;
    private String supplierName; // Tiện cho Frontend hiển thị tên NCC

    private String creatorId;
    private String creatorName; // Sẽ map từ UserEntity sang (đã xử lý ở Service)
    private String attachmentUrl;
    private Double totalAmount;
    private String note;
    private ReceiptStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ReceiptDetailResponse> details;
}