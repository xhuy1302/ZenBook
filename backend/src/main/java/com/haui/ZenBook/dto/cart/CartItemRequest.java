package com.haui.ZenBook.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotBlank(message = "ID sách không được để trống")
    private String bookId;

    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity;
}