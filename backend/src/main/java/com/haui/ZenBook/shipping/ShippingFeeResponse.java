package com.haui.ZenBook.shipping;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShippingFeeResponse {
    private double rawOrderTotal;
    private double orderDiscount;
    private double finalOrderTotal;

    private double baseShippingFee;
    private double shippingDiscount;
    private double finalShippingFee;

    private double totalPayment;
}
