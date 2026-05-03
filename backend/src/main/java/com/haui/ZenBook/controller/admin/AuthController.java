package com.haui.ZenBook.controller.admin; // (Lưu ý nhỏ: Thường AuthController sẽ để ở package controller thay vì controller.admin vì nó là public API, nhưng nếu Huy cố ý chia thư mục thế này thì cứ giữ nguyên nhé)

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.auth.AuthResponse;
import com.haui.ZenBook.dto.auth.LoginRequest;
import com.haui.ZenBook.dto.auth.VerifyOtpRequest; // 👉 Đã thêm import này
import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;
import com.haui.ZenBook.service.AuthService;
import com.haui.ZenBook.service.UserService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final MessageUtil messageUtil;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .data(userService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.<AuthResponse>builder()
                .data(authService.login(request))
                .message("Đăng nhập thành công")
                .build();
    }

    // 👉 THÊM API XÁC THỰC OTP Ở ĐÂY
    @PostMapping("/verify-signup")
    public ApiResponse<AuthResponse> verifySignUp(@Valid @RequestBody VerifyOtpRequest request) {
        return ApiResponse.<AuthResponse>builder()
                .data(authService.verifySignUp(request))
                .message("Xác thực tài khoản thành công")
                .build();
    }
}