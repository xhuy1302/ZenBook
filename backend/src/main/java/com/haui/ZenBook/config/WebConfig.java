package com.haui.ZenBook.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("http://localhost:5173"); // Cho phép cổng 5173 của React
        corsConfiguration.addAllowedHeader("*"); // Cho phép mọi header
        corsConfiguration.addAllowedMethod("*"); // Cho phép mọi method (GET, POST, PUT, DELETE...)
        corsConfiguration.setAllowCredentials(true); // Bắt buộc phải có để gửi kèm Token/Cookie

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration); // Áp dụng cho mọi API

        return new CorsFilter(source);
    }
}