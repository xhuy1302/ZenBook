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

                        // 1. API PUBLIC (Không cần đăng nhập)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/news", "/api/v1/news/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/promotions/flash-sale/active").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/books", "/api/v1/books/**").permitAll()
                        .requestMatchers("/api/v1/customer/**").authenticated()

                        // 2. API ADMIN & STAFF (Nghiệp vụ cửa hàng)
                        .requestMatchers("/api/v1/admin/authors/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/categories/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/suppliers/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/books/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/receipts/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/news/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/promotions/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/v1/admin/dashboard/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/files/**").hasAnyRole("ADMIN", "STAFF")

                        // 3. API CHỈ DÀNH CHO ADMIN ROOT (Quản lý người dùng)
                        .requestMatchers("/api/v1/admin/users/**").hasRole("ADMIN")

                        // ========================================================
                        // 👉 BỔ SUNG SỐ 4: API DÀNH CHO NGƯỜI MUA HÀNG (CUSTOMER)
                        // Bao gồm quản lý thông tin cá nhân, sổ địa chỉ, đơn hàng, giỏ hàng
                        // ========================================================
                        .requestMatchers(
                                "/api/v1/users/update",
                                "/api/v1/users/change-password",
                                "/api/v1/users/addresses/**",
                                "/api/v1/orders/my",
                                "/api/v1/orders/**", // Hoặc các đường dẫn đặt hàng sau này
                                "/api/v1/cart/**"    // Giỏ hàng
                        ).hasAnyRole("USER", "ADMIN", "STAFF") // Cấp quyền cho USER (và cả nhân viên nếu họ muốn tự mua hàng)

                        // 5. CÁC YÊU CẦU CÒN LẠI (Chặn toàn bộ các URL không khai báo nếu chưa đăng nhập)
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}