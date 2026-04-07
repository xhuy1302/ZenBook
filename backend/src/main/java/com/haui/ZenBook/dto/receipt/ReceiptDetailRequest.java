package com.haui.ZenBook.dto.receipt;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetailRequest {

    @NotBlank(message = "ID sách không được để trống")
    private String bookId;

    @NotNull(message = "Số lượng nhập không được để trống")
    @Min(value = 1, message = "Số lượng nhập tối thiểu là 1")
    private Integer quantity;

    @NotNull(message = "Giá nhập không được để trống")
    @Min(value = 0, message = "Giá nhập không được nhỏ hơn 0")
    private Double importPrice;
}