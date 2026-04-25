package com.haui.ZenBook.controller;

import com.haui.ZenBook.config.VNPayConfig;
import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.enums.PaymentStatus;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @Value("${vnpay.hashSecret}")
    private String secretKey;

    // 1. API Frontend gọi để lấy URL thanh toán
    @GetMapping("/create-url/{orderId}")
    public ResponseEntity<?> createPaymentUrl(@PathVariable String orderId, HttpServletRequest request) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow();
        String paymentUrl = paymentService.createVnPayUrl(order, request);
        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }

    // 2. WEBHOOK - VNPAY GỌI VỀ SAU KHI THANH TOÁN
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<?> vnpayIPN(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) fields.remove("vnp_SecureHashType");
            if (fields.containsKey("vnp_SecureHash")) fields.remove("vnp_SecureHash");

            // Build lại hashData để verify
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();

            try {
                for (String fieldName : fieldNames) {
                    String fieldValue = fields.get(fieldName);
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        // Encode lại giá trị vì request.getParameter đã tự decode trước đó
                        String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());
                        hashData.append(fieldName).append('=').append(encodedValue);

                        if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                            hashData.append('&');
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi encode trong IPN", e);
            }

            String signValue = VNPayConfig.hmacSHA512(secretKey, hashData.toString());

            // 1. Kiểm tra chữ ký
            if (signValue.equals(vnp_SecureHash)) {
                String orderCode = request.getParameter("vnp_TxnRef");
                OrderEntity order = orderRepository.findByOrderCode(orderCode).orElse(null);

                // 2. Kiểm tra tồn tại đơn hàng
                if (order != null) {
                    long vnpAmount = Long.parseLong(request.getParameter("vnp_Amount")) / 100;

                    // 3. Kiểm tra số tiền
                    if (vnpAmount == order.getFinalTotal().longValue()) {

                        // 4. Kiểm tra trạng thái thanh toán hiện tại
                        if (order.getPaymentStatus() == PaymentStatus.UNPAID) {
                            String responseCode = request.getParameter("vnp_ResponseCode");

                            // 00 là thanh toán thành công
                            if ("00".equals(responseCode)) {
                                order.setPaymentStatus(PaymentStatus.PAID);
                                order.setStatus(OrderStatus.CONFIRMED);
                                log.info("Đơn hàng {} thanh toán VNPAY thành công", orderCode);
                                log.info("Đơn hàng {} thanh toán VNPAY thành công và đã tự động xác nhận", orderCode);
                            } else {
                                order.setPaymentStatus(PaymentStatus.FAILED);
                                // Có thể chuyển sang CANCELLED nếu thanh toán lỗi
                                order.setStatus(OrderStatus.CANCELLED);
                                log.info("Đơn hàng {} thanh toán VNPAY thất bại", orderCode);
                            }
                            orderRepository.save(order);
                            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
                        } else {
                            return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));
                        }
                    } else {
                        return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid Amount"));
                    }
                } else {
                    return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
                }
            } else {
                log.warn("Sai chữ ký IPN. Hash VNPAY: {}, Hash Server: {}", vnp_SecureHash, signValue);
                return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
            }
        } catch (Exception e) {
            log.error("Lỗi xử lý IPN VNPAY", e);
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Unknown error"));
        }
    }
}