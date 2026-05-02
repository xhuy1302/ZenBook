package com.haui.ZenBook.dto.order;


import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private String id;
    private String orderCode;
    private String userId;

    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String shippingAddress;

    private Double totalItemsPrice;
    private Double shippingFee;
    private Double orderDiscount;
    private Double shippingDiscount;
    private Double finalTotal;

    private String paymentMethod;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Danh sách sản phẩm và lịch sử đi kèm
    private List<OrderDetailResponse> details;
    private List<OrderHistoryResponse> histories;
}
