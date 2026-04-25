package com.haui.ZenBook.dto.cart;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private String id;
    private List<CartDetailResponse> details;
    private Double totalPrice; // Tính tổng tiền giỏ hàng
}