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
                        // 1. PUBLIC API (KHÁCH VÃNG LAI) - GIỮ NGUYÊN
                        // ==========================================
                        .requestMatchers("/api/v1/support-chat/**").permitAll()
                        .requestMatchers("/ws-support/**").permitAll()
                        .requestMatchers("/api/v1/chat/**").permitAll()
                        .requestMatchers("/api/v1/auth/**", "/api/v1/public/**", "/api/v1/payment/vnpay/ipn").permitAll()
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/books/**", "/api/v1/categories/**", "/api/v1/news/**",
                                "/api/v1/authors/**", "/api/v1/publishers/**", "/api/v1/promotions/**",
                                "/api/v1/tags/**", "/api/v1/reviews/**", "/api/v1/customer/**",
                                "/api/v1/address/**", "/api/v1/coupons/**"
                        ).permitAll()
                        .requestMatchers("/api/v1/coupons/validate").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/public/news/*/view").permitAll()

                        // ==========================================
                        // 2. ADMIN ONLY - STAFF KHÔNG ĐƯỢC PHÉP
                        // ==========================================
                        // 2A. Chặn Dashboard, Nhà cung cấp, Chatbot (Giữ Admin Only)
                        .requestMatchers(
                                "/api/v1/admin/dashboard/**",
                                "/api/v1/admin/suppliers/**",
                                "/api/v1/admin/chatbot/**"
                        ).hasRole("ADMIN")

                        // 2B. Metadata nâng cao & Khuyến mãi
                        .requestMatchers("/api/v1/coupons/**", "/api/v1/promotions/**").hasRole("ADMIN")

                        // 2C. Quản lý User chuyên sâu
                        .requestMatchers("/api/v1/users/trash/**", "/api/v1/users/restore/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasRole("ADMIN")

                        // 2D. Xóa cứng vĩnh viễn
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/books/hard-delete/**", "/api/v1/news/{id}").hasRole("ADMIN")

                        // ==========================================
                        // 3. STAFF & ADMIN: NGHIỆP VỤ VẬN HÀNH
                        // ==========================================
                        // Mở quyền Phiếu nhập kho (Receipts) cho STAFF quản lý kho
                        .requestMatchers("/api/v1/admin/receipts/**").hasAnyRole("ADMIN", "STAFF")

                        // Quản lý Metadata (Staff được Thêm/Sửa nhưng không được Xóa)
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**", "/api/v1/authors/**", "/api/v1/publishers/**", "/api/v1/tags/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**", "/api/v1/authors/**", "/api/v1/publishers/**", "/api/v1/tags/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**", "/api/v1/authors/**", "/api/v1/publishers/**", "/api/v1/tags/**").hasRole("ADMIN")

                        // Xem danh sách người dùng
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("ADMIN")

                        // Nghiệp vụ vận hành lõi
                        .requestMatchers("/api/v1/admin/books/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/news/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/invoices/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/reviews/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/chat/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/files/**").hasAnyRole("ADMIN", "STAFF")

                        // ==========================================
                        // 4. CUSTOMER API: CHỈ USER/ADMIN MỚI ĐƯỢC PHÉP
                        // ==========================================
                        .requestMatchers(
                                "/api/v1/cart/**",
                                "/api/v1/payment/create-url/**",
                                "/api/v1/orders/my/**",
                                "/api/v1/orders/my-orders",
                                "/api/v1/users/addresses/**"
                        ).hasAnyRole("USER", "ADMIN")

                        // Các thao tác cá nhân chung
                        .requestMatchers(
                                "/api/v1/customer/**",
                                "/api/v1/address/**",
                                "/api/v1/users/update",
                                "/api/v1/users/wishlist",
                                "/api/v1/users/change-password",
                                "/api/v1/orders/**"
                        ).hasAnyRole("USER", "ADMIN", "STAFF")

                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/{userId}").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/{userId}/avatar").hasAnyRole("USER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/{userId}").hasAnyRole("USER", "ADMIN")

                        // ==========================================
                        // 5. CÁC ENDPOINT CÒN LẠI
                        // ==========================================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}