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
                        // 1. PUBLIC API (KHÁCH VÃNG LAI)
                        // ==========================================
                        .requestMatchers("/api/v1/chat").permitAll()

                        // Các API auth, public khác của bạn...
                        .requestMatchers("/api/v1/auth/**", "/api/v1/public/**").permitAll()

                        .requestMatchers("/api/v1/chat/**").permitAll()
                        .requestMatchers("/api/v1/auth/**", "/api/v1/payment/vnpay/ipn").permitAll()
                        .requestMatchers("/api/v1/notifications/**").authenticated() // Yêu cầu đăng nhập mới được xem thông báo
                        // Tất cả các API xem dữ liệu (GET) đều được phép truy cập tự do
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/books", "/api/v1/books/**",
                                "/api/v1/categories", "/api/v1/categories/**",
                                "/api/v1/news", "/api/v1/news/**",
                                "/api/v1/public/news/**",
                                "/api/v1/authors/**",
                                "/api/v1/publishers/**",
                                "/api/v1/promotions/**",
                                "/api/v1/promotions/flash-sale/active",
                                "/api/v1/tags/**",
                                "/api/v1/reviews/**",
                                "/api/v1/customer/**", // GET Customer info
                                "/api/v1/address/**",  // GET GHN API
                                "/api/v1/coupons",
                                "/api/v1/coupons/{id}"
                        ).permitAll()

                        // API đặc thù công khai
                        .requestMatchers("/api/v1/coupons/validate").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/public/news/*/view").permitAll()


                        // ==========================================
                        // 2. ADMIN ONLY (QUYỀN LỰC CAO NHẤT)
                        // ==========================================
                        // 2A. Quản trị hệ thống, Dashboard (Bao gồm cả Export), Tài chính, Nhập kho
                        .requestMatchers(
                                "/api/v1/admin/dashboard/**", // Đã bao gồm API /export
                                "/api/v1/admin/receipts/**",
                                "/api/v1/admin/suppliers/**",
                                "/api/v1/admin/chatbot/**"
                        ).hasRole("ADMIN")

                        // 2B. Metadata & Khuyến mãi (Staff KHÔNG được đụng)
                        .requestMatchers(
                                "/api/v1/categories/**",
                                "/api/v1/authors/**",
                                "/api/v1/publishers/**",
                                "/api/v1/coupons/**",
                                "/api/v1/promotions/**",
                                "/api/v1/tags/**"
                        ).hasRole("ADMIN")

                        // 2C. QUẢN LÝ USER: Chặn hoàn toàn Staff, chỉ Admin được phép xem danh sách, xóa, khôi phục
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/trash/**", "/api/v1/users/restore/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/**").hasRole("ADMIN")

                        // 2D. CHẶN XÓA CỨNG (SÁCH VÀ TIN TỨC): Chỉ Admin được xóa vĩnh viễn
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/books/hard-delete/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/news/{id}").hasRole("ADMIN")


                        // ==========================================
                        // 3. STAFF & ADMIN: 4 NGHIỆP VỤ VẬN HÀNH LÕI
                        // ==========================================
                        // Nghiệp vụ 1: Sản phẩm (Được Thêm, Sửa, Xóa Mềm, Khôi phục)
                        .requestMatchers("/api/v1/admin/books/**").hasAnyRole("ADMIN", "STAFF")

                        // Nghiệp vụ 2: Tin tức (Được Thêm, Sửa, Xóa Mềm, Khôi phục)
                        .requestMatchers("/api/v1/news/**").hasAnyRole("ADMIN", "STAFF")

                        // Nghiệp vụ 3: Đơn hàng & Vận chuyển (Bao gồm cả Xuất PDF hóa đơn)
                        .requestMatchers("/api/v1/admin/invoices/**").hasAnyRole("ADMIN", "STAFF")

                        // Nghiệp vụ 4: Trả lời/Duyệt Review
                        .requestMatchers("/api/v1/admin/reviews/**").hasAnyRole("ADMIN", "STAFF")

                        // Quyền upload ảnh cho sách/tin tức
                        .requestMatchers("/api/files/**").hasAnyRole("ADMIN", "STAFF")


                        // ==========================================
                        // 4. CUSTOMER API (HOẠT ĐỘNG CÁ NHÂN CỦA USER/KHÁCH HÀNG)
                        // ==========================================
                        // Trả lại toàn quyền cho Customer & Address (Tạo, Sửa, Xóa sổ địa chỉ...)
                        .requestMatchers(
                                "/api/v1/customer/**",     // 👉 Trả lại Customer API
                                "/api/v1/address/**",      // 👉 Trả lại Address/GHN (POST/PUT/DELETE)
                                "/api/v1/users/update",
                                "/api/v1/users/change-password",
                                "/api/v1/users/addresses/**", // 👉 Sổ địa chỉ người dùng
                                "/api/v1/orders/my",
                                "/api/v1/orders/my-orders",
                                "/api/v1/orders/**",
                                "/api/v1/cart/**",
                                "/api/v1/payment/create-url/**"
                        ).hasAnyRole("USER", "ADMIN", "STAFF")

                        // Mọi người được phép thao tác với dữ liệu Profile và Review cá nhân
                        .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").hasAnyRole("USER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/{userId}").hasAnyRole("USER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/{userId}/avatar").hasAnyRole("USER", "ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/{userId}").hasAnyRole("USER", "ADMIN", "STAFF")


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