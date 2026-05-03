package com.haui.ZenBook.shipping;

import com.haui.ZenBook.entity.AddressEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class GHNShippingProvider {
    @Value("${ghn.token}") private String token;
    @Value("${ghn.shop-id}") private String shopId;

    public double calculateFee(AddressEntity address, double weightGram, double insuranceValue) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", token);
        headers.set("ShopId", shopId);

        Map<String, Object> body = new HashMap<>();
        body.put("from_district_id", 3440); // Nam Từ Liêm
        body.put("to_district_id", address.getDistrictId());
        body.put("to_ward_code", address.getWardCode());
        body.put("weight", (int) weightGram);
        body.put("insurance_value", (int) insuranceValue);
        body.put("length", 15);
        body.put("width", 15);
        body.put("height", 10);
        body.put("service_type_id", 2);

        try {
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getBody() != null && response.getBody().get("data") != null) {
                Map data = (Map) response.getBody().get("data");
                double rawFee = Double.parseDouble(data.get("total").toString());

                String currentDistrictId = address.getDistrictId().toString();
                log.info("District ID khách chọn: {}", currentDistrictId);

                // 👉 DANH SÁCH ID NỘI THÀNH HÀ NỘI (Đã thêm 1485 của Huy)
                List<String> innerHanoiIds = Arrays.asList(
                        "3440", // Nam Từ Liêm
                        "1444", // Cầu Giấy
                        "1485", // ID Huy vừa check (Ba Đình/Hoàn Kiếm)
                        "1448", // Đống Đa
                        "1452", // Thanh Xuân
                        "1442"  // Hoàn Kiếm
                );

                // 1. ÉP GIÁ NỘI THÀNH: 22.000đ
                if (innerHanoiIds.contains(currentDistrictId)) {
                    log.info("Nhận diện nội thành -> Ép giá 22k");
                    return 22000.0;
                }

                // 2. ÉP GIÁ LIÊN TỈNH XA (Ví dụ HCM, Miền Tây): 55.000đ
                if (rawFee > 60000) {
                    return 55000.0;
                }

                // 3. ÉP GIÁ NGOẠI THÀNH/LIÊN TỈNH GẦN: 38.000đ
                if (rawFee >= 35000) {
                    return 38000.0;
                }

                return rawFee;
            }
            return 30000.0;
        } catch (Exception e) {
            log.error("LỖI GHN: {}", e.getMessage());
            return 25000.0;
        }
    }
}