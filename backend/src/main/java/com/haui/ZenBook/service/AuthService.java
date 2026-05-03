package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.auth.AuthResponse;
import com.haui.ZenBook.dto.auth.LoginRequest;
import com.haui.ZenBook.dto.user.UserCreationRequest; // Tên DTO đăng ký của bạn có thể khác (ví dụ: RegisterRequest)
import com.haui.ZenBook.dto.auth.VerifyOtpRequest;

public interface AuthService {

    // 1. Đăng nhập (Nhập đúng là vào luôn, không OTP)
    AuthResponse login(LoginRequest request);

    // 3. Xác thực mã OTP để kích hoạt tài khoản
    AuthResponse verifySignUp(VerifyOtpRequest request);
}