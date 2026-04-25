package com.haui.ZenBook.service;

import com.haui.ZenBook.config.VNPayConfig;
import com.haui.ZenBook.entity.OrderEntity;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String secretKey;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @Override
    public String createVnPayUrl(OrderEntity order, HttpServletRequest request) {
        long amount = (long) (order.getFinalTotal() * 100);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", order.getOrderCode());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);

        // ✅ BƯỚC 1: Fix cứng IP Localhost để test, tránh lỗi IPv6 gây sai chữ ký
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");
        // Lưu ý: Khi nào deploy lên server thật (VPS/Hosting), hãy mở lại dòng code dưới đây:
        // vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

        // ✅ GIỮ NGUYÊN FIX MÚI GIỜ VIỆT NAM (Đã thành công ở bước trước)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        try {
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {

                    // Xóa bỏ replace, dùng chuẩn US_ASCII như SDK VNPAY
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());

                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(encodedValue);

                    // Build query
                    query.append(fieldName);
                    query.append('=');
                    query.append(encodedValue);

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi Encode URL VNPAY: ", e);
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        // In ra Console để debug nếu vẫn lỗi
        log.info(">>> [VNPAY] Chuỗi Hash Data: {}", hashData.toString());
        log.info(">>> [VNPAY] Chữ ký tạo ra: {}", vnp_SecureHash);

        return vnp_PayUrl + "?" + queryUrl;
    }
}