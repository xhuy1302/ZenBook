package com.haui.ZenBook.shipping;

import com.haui.ZenBook.dto.order.OrderItemRequest;
import lombok.Data;

import java.util.List;

@Data
public class ShippingFeeRequest {
    private String addressId; // ID địa chỉ khách đã lưu trong DB
    private List<OrderItemRequest> items; // Danh sách sách khách mua
    private String orderVoucherCode;
    private String shippingVoucherCode;
    private String userId;// Mã giảm giá shop (nếu có)
}
