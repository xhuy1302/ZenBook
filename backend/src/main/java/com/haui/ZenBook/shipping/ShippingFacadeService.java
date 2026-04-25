package com.haui.ZenBook.shipping;

import com.haui.ZenBook.entity.AddressEntity;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.repository.AddressRepository;
import com.haui.ZenBook.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShippingFacadeService {
    private final ShippingCalculator calculator;
    private final GHNShippingProvider ghnProvider;
    private final CouponService couponService;
    private final AddressRepository addressRepository;

    public ShippingFeeResponse preview(ShippingFeeRequest request) {
        AddressEntity address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        // 👉 Bước quan trọng: Lấy Map sách trước
        Map<String, BookEntity> bookMap = calculator.getBooksForOrder(request.getItems());

        // 👉 Truyền bookMap vào các hàm tính toán
        double rawOrderTotal = calculator.calculateOrderTotal(request.getItems(), bookMap);
        double weight = calculator.calculateTotalWeight(request.getItems(), bookMap);

        double baseShippingFee = ghnProvider.calculateFee(address, weight, rawOrderTotal);

        double orderDiscount = couponService.calculateDiscount(
                request.getOrderVoucherCode(), rawOrderTotal, rawOrderTotal, CouponType.ORDER);
        double finalOrderTotal = Math.max(rawOrderTotal - orderDiscount, 0);

        double shippingDiscount = couponService.calculateDiscount(
                request.getShippingVoucherCode(), baseShippingFee, rawOrderTotal, CouponType.SHIPPING);
        double finalShippingFee = Math.max(baseShippingFee - shippingDiscount, 0);

        return ShippingFeeResponse.builder()
                .rawOrderTotal(rawOrderTotal)
                .orderDiscount(orderDiscount)
                .finalOrderTotal(finalOrderTotal)
                .baseShippingFee(baseShippingFee)
                .shippingDiscount(shippingDiscount)
                .finalShippingFee(finalShippingFee)
                .totalPayment(finalOrderTotal + finalShippingFee)
                .build();
    }
}