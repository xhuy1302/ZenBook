package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.shipping.ShippingFacadeService;
import com.haui.ZenBook.shipping.ShippingFeeRequest;
import com.haui.ZenBook.shipping.ShippingFeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingFacadeService shippingFacadeService;

    // 👉 Hàm hỗ trợ lấy ID từ Token, nếu khách vãng lai (chưa đăng nhập) thì trả về null
    private String getUserIdFromToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping("/calculate")
    public ResponseEntity<ShippingFeeResponse> previewCheckout(
            @RequestBody ShippingFeeRequest request,
            Authentication authentication) { // 👉 Đón Authentication từ Spring Security

        // 1. Lấy userId người đang thao tác
        String userId = getUserIdFromToken(authentication);

        // 2. Truyền userId vào service để nó kiểm tra xem ông này có phải VIP (Platinum/Diamond) không
        return ResponseEntity.ok(shippingFacadeService.preview(request, userId));
    }
}