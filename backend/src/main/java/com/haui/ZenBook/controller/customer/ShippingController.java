package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.shipping.ShippingFacadeService;
import com.haui.ZenBook.shipping.ShippingFeeRequest;
import com.haui.ZenBook.shipping.ShippingFeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingFacadeService shippingFacadeService;

    @PostMapping("/calculate")
    public ResponseEntity<ShippingFeeResponse> previewCheckout(@RequestBody ShippingFeeRequest request) {
        return ResponseEntity.ok(shippingFacadeService.preview(request));
    }
}
