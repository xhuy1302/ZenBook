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

    // 👉 Đã đổi biến và thông báo lỗi sang Nhà cung cấp
    @NotBlank(message = "Nhà cung cấp không được để trống")
    private String supplierId;

    private String note;

    private String attachmentUrl;

    @NotEmpty(message = "Danh sách sản phẩm nhập không được để trống")
    @Valid // Kích hoạt validate cho từng item trong danh sách
    private List<ReceiptDetailRequest> details;

}