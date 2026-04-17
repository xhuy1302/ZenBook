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

    // 👉 Đã đổi biến
    private String publisherId;
    private String publisherName; // Tiện cho Frontend đỡ phải gọi API phụ

    private String creatorId;
    private String creatorName; // Sẽ map từ UserEntity sang
    private String attachmentUrl;
    private Double totalAmount;
    private String note;
    private ReceiptStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ReceiptDetailResponse> details;
}