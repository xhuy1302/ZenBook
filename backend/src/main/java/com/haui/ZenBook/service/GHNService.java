package com.haui.ZenBook.service;

import com.haui.ZenBook.entity.AddressEntity;
import com.haui.ZenBook.enums.OrderStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GHNService {

    // Lấy token từ cấu hình file application.yml
    @Value("${GHN_TOKEN}")
    private String ghnToken;


    private final RestTemplate restTemplate = new RestTemplate();
    private final String GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data";

    // Hàm tạo Header chứa Token để gửi cho GHN
    private HttpEntity<String> getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnToken);
        return new HttpEntity<>(headers);
    }

    public Object getProvinces() {
        String url = GHN_BASE_URL + "/province";
        // Gửi GET request tới GHN và hứng toàn bộ object trả về
        ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), Object.class);
        return response.getBody();
    }

    public Object getDistricts(Integer provinceId) {
        String url = GHN_BASE_URL + "/district?province_id=" + provinceId;
        ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), Object.class);
        return response.getBody();
    }

    public Object getWards(Integer districtId) {
        String url = GHN_BASE_URL + "/ward?district_id=" + districtId;
        ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, getHeaders(), Object.class);
        return response.getBody();
    }
}