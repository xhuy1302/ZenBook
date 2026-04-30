package com.haui.ZenBook.shipping;

import com.haui.ZenBook.entity.AddressEntity;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.MembershipEntity;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.enums.MemberTier;
import com.haui.ZenBook.repository.AddressRepository;
import com.haui.ZenBook.repository.MembershipRepository;
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

    // 👉 THÊM MỚI: Inject Membership để check hạng VIP
    private final MembershipRepository membershipRepository;

    // 👉 Sửa: Thêm String userId vào tham số
    public ShippingFeeResponse preview(ShippingFeeRequest request, String userId) {
        AddressEntity address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        Map<String, BookEntity> bookMap = calculator.getBooksForOrder(request.getItems());
        double rawOrderTotal = calculator.calculateOrderTotal(request.getItems(), bookMap);
        double weight = calculator.calculateTotalWeight(request.getItems(), bookMap);

        // 1. Phí ship gốc từ GHN
        double baseShippingFee = ghnProvider.calculateFee(address, weight, rawOrderTotal);

        // 2. Tính mã giảm giá đơn hàng
        double orderDiscount = couponService.calculateDiscount(
                request.getOrderVoucherCode(), rawOrderTotal, rawOrderTotal, CouponType.ORDER);
        double finalOrderTotal = Math.max(rawOrderTotal - orderDiscount, 0);

        // 3. XỬ LÝ ĐẶC QUYỀN FREESHIP VIP
        double shippingDiscount = 0.0;

        if (userId != null) {
            MembershipEntity membership = membershipRepository.findByUserId(userId).orElse(null);
            // Nếu là Bạch Kim hoặc Kim Cương -> Giảm 100% phí ship luôn, không cần áp mã!
            if (membership != null &&
                    (membership.getTier() == MemberTier.PLATINUM || membership.getTier() == MemberTier.DIAMOND)) {
                shippingDiscount = baseShippingFee;
            } else {
                // Nếu không phải VIP bự, thì tính discount theo mã Freeship khách áp dụng
                shippingDiscount = couponService.calculateDiscount(
                        request.getShippingVoucherCode(), baseShippingFee, rawOrderTotal, CouponType.SHIPPING);
            }
        } else {
            shippingDiscount = couponService.calculateDiscount(
                    request.getShippingVoucherCode(), baseShippingFee, rawOrderTotal, CouponType.SHIPPING);
        }

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