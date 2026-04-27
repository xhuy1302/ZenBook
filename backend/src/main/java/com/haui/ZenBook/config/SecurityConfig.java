package com.haui.ZenBook.config;

import com.haui.ZenBook.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // ==========================================
                        // 1. PUBLIC API (KHÔNG CẦN ĐĂNG NHẬP)
                        // ==========================================
                        // Auth & Webhooks
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/payment/vnpay/ipn").permitAll()

                        // Books, Categories, News, Promotions (Chỉ cho phép đọc)
                        .requestMatchers(HttpMethod.GET, "/api/v1/books", "/api/v1/books/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/news", "/api/v1/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/promotions/flash-sale/active").permitAll()

                        // Public APIs khác
                        .requestMatchers(HttpMethod.GET, "/api/v1/customer/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/address/**").permitAll()

                        // Public Action: Tăng view
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/public/news/*/view").permitAll()


                        // ==========================================
                        // 2. ĐẶC QUYỀN ADMIN (QUY TẮC CỤ THỂ ĐẶT TRƯỚC)
                        // Chặn các hành động xóa thực thể cốt lõi hoặc can thiệp dữ liệu nhạy cảm
                        // ==========================================
                        // Quản lý người dùng, khuyến mãi, nhập kho (Mọi hành động)
                        .requestMatchers("/api/v1/admin/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/promotions/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/receipts/**").hasRole("ADMIN")

                        // Chặn hành động Thêm/Sửa/Xóa các danh mục cốt lõi
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")

                        // Chặn hành động Xóa các thực thể khác
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/books/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/reviews/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/news/**").hasRole("ADMIN")


                        // ==========================================
                        // 3. QUYỀN VẬN HÀNH (ADMIN + STAFF)
                        // ==========================================
                        // Các endpoint Admin còn lại (Dashboards, quản lý Order, tạo Book, trả lời Review, tạo News...)
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF")

                        // Quản lý File Upload
                        .requestMatchers("/api/files/**").hasAnyRole("ADMIN", "STAFF")


                        // ==========================================
                        // 4. CUSTOMER API (BẮT BUỘC ĐĂNG NHẬP)
                        // ==========================================
                        .requestMatchers(
                                "/api/v1/users/update",
                                "/api/v1/users/change-password",
                                "/api/v1/users/addresses/**",
                                "/api/v1/orders/my",
                                "/api/v1/orders/my-orders",
                                "/api/v1/orders/**",
                                "/api/v1/cart/**",
                                "/api/v1/reviews/**", // Khách hàng được tạo/sửa review của chính họ
                                "/api/v1/payment/create-url/**"
                        ).hasAnyRole("USER", "ADMIN", "STAFF")

                        // ==========================================
                        // 5. CÁC ENDPOINT CÒN LẠI (Nếu có)
                        // ==========================================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}