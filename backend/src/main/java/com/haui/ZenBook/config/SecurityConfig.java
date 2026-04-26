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
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/news", "/api/v1/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/promotions/flash-sale/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/books", "/api/v1/books/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/customer/**").permitAll()
                        .requestMatchers("/api/v1/address/**").permitAll()
                        .requestMatchers("/api/v1/payment/vnpay/ipn").permitAll() // Webhook VNPAY
                        .requestMatchers(HttpMethod.GET, "/api/v1/public/news/**").permitAll() // Lấy list, chi tiết, stats, featured
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/public/news/*/view").permitAll() // Tăng lượt xem công khai
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        // Cho phép xem danh sách review public
                        .requestMatchers(HttpMethod.GET, "/api/v1/books/*/reviews").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/news", "/api/v1/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()

                        // ==========================================
                        // 2. ĐẶC QUYỀN ADMIN (CHỈ ADMIN ĐƯỢC PHÉP TRUY CẬP)
                        // LƯU Ý: Phải đặt lên trước các rule của STAFF
                        // ==========================================
                        // Quản lý nhân sự & Người dùng
                        .requestMatchers("/api/v1/admin/users/**").hasRole("ADMIN")

                        // Quản lý dòng tiền, nhập kho, khuyến mãi lớn
                        .requestMatchers("/api/v1/admin/promotions/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/receipts/**").hasRole("ADMIN")

                        // Quyền THÊM/SỬA/XÓA các dữ liệu danh mục cốt lõi (STAFF chỉ được GET)
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/categories/**", "/api/v1/admin/suppliers/**", "/api/v1/admin/authors/**").hasRole("ADMIN")

                        // Các hành động XÓA nhạy cảm đối với thực thể chính
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/books/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/reviews/**").hasRole("ADMIN") // Ngăn Staff tự ý xóa đánh giá/phản hồi
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/news/**").hasRole("ADMIN")

                        // ==========================================
                        // 3. QUYỀN VẬN HÀNH CHUNG (ADMIN & STAFF)
                        // ==========================================
                        // Cho phép STAFF gọi GET để xem mọi thứ trong trang quản trị
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF")

                        // STAFF được làm việc với Sách (Tạo/Sửa/Upload Ảnh) - Lưu ý: Quyền XÓA đã bị chặn ở trên
                        .requestMatchers("/api/v1/admin/books/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/files/**").hasAnyRole("ADMIN", "STAFF")

                        // STAFF được làm việc với Đánh giá (Duyệt/Trả lời khách)
                        .requestMatchers("/api/v1/admin/reviews/**").hasAnyRole("ADMIN", "STAFF")

                        // STAFF được viết/sửa bài Tin tức
                        .requestMatchers("/api/v1/admin/news/**").hasAnyRole("ADMIN", "STAFF")

                        // STAFF được xem Dashboard thống kê
                        .requestMatchers("/api/v1/admin/dashboard/**").hasAnyRole("ADMIN", "STAFF")

                        // ==========================================
                        // 4. API DÀNH CHO KHÁCH HÀNG (YÊU CẦU LOGIN)
                        // ==========================================
                        .requestMatchers(
                                "/api/v1/users/update",
                                "/api/v1/users/change-password",
                                "/api/v1/users/addresses/**",
                                "/api/v1/orders/my",
                                "/api/v1/orders/my-orders",
                                "/api/v1/orders/**",
                                "/api/v1/cart/**",
                                "/api/v1/payment/create-url/**"
                        ).hasAnyRole("USER", "ADMIN", "STAFF")

                        // Khóa toàn bộ các URL còn lại
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}