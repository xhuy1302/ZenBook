package com.haui.ZenBook.shipping;

import com.haui.ZenBook.entity.AddressEntity;
import lombok.extern.slf4j.Slf4j;
import com.haui.ZenBook.entity.OrderDetailEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class GHNShippingProvider {
    @Value("${ghn.token}") private String token;
    @Value("${ghn.shop-id}") private String shopId;

    // 👉 Đã thêm tham số insuranceValue
    public double calculateFee(AddressEntity address, double weightKg, double insuranceValue) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", token);
        headers.set("ShopId", shopId);

        Map<String, Object> body = new HashMap<>();
        body.put("from_district_id", 3440); // ID Quận nơi kho hàng của bạn đặt (Nam Từ Liêm)
        body.put("to_district_id", address.getDistrictId());
        body.put("to_ward_code", address.getWardCode());

        // GHN nhận gram: 0.3kg * 1000 = 300g (Chuẩn xác)
        body.put("weight", (int)(weightKg * 1000));

        // 👉 Cung cấp giá trị hàng hóa để GHN tính phí bảo hiểm chính xác
        body.put("insurance_value", (int)insuranceValue);

        body.put("length", 20);
        body.put("width", 15);
        body.put("height", 10);
        body.put("service_type_id", 2);

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map data = (Map) response.getBody().get("data");
            return Double.parseDouble(data.get("total").toString());
        } catch (Exception e) {
            log.error("LỖI GHN: {}", e.getMessage());
            return 30000.0;
        }
    }

}