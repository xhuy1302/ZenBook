package com.haui.ZenBook.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class OrderUpdateRequest {
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;
    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;
    private String note;

    @NotEmpty(message = "Giỏ hàng không được để trống")
    @Valid
    private List<OrderItemRequest> items;
}