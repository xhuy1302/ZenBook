package com.haui.ZenBook.dto.receipt;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptRequest {

    // 👉 Đã sửa thông báo lỗi và tên biến
    @NotBlank(message = "Nhà xuất bản không được để trống")
    private String publisherId;

    private String note;

    private String attachmentUrl;

    @NotEmpty(message = "Danh sách sản phẩm nhập không được để trống")
    @Valid // Kích hoạt validate cho từng item trong danh sách
    private List<ReceiptDetailRequest> details; // Đã đổi từ ReceiptDetailItem sang ReceiptDetailRequest

}