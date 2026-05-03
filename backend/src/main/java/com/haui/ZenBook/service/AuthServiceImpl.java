package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.auth.AuthResponse;
import com.haui.ZenBook.dto.auth.LoginRequest;
import com.haui.ZenBook.dto.auth.PendingRegistration;
import com.haui.ZenBook.dto.auth.VerifyOtpRequest;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.UserStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.UserMapper;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    // 👉 TIÊM USERSERVICE VÀO ĐÂY (NẾU CHƯA CÓ)
    private final UserService userService;

    @Override
    public AuthResponse login(LoginRequest request) {
        // Đăng nhập bình thường (1 bước, không cần OTP)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, request.getEmail()));

        if (user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.DELETED) {
            throw new AppException(ErrorCode.INVALID_DATA, "Tài khoản đang bị khóa hoặc chưa kích hoạt.");
        }

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    public AuthResponse verifySignUp(VerifyOtpRequest request) {
        // 1. Lấy thông tin đăng ký đang chờ xác thực từ "Cache"
        PendingRegistration pendingReg = userService.getPendingRegistration(request.getEmail());

        if (pendingReg == null) {
            throw new AppException(ErrorCode.INVALID_DATA, "Không tìm thấy yêu cầu đăng ký hoặc phiên đã hết hạn. Vui lòng đăng ký lại.");
        }

        // 2. Kiểm tra mã OTP
        if (!pendingReg.getOtpCode().equals(request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_DATA, "Mã OTP không hợp lệ");
        }

        // 3. Kiểm tra thời gian hết hạn
        if (pendingReg.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_DATA, "Mã OTP đã hết hạn");
        }

        // 4. Mã hợp lệ -> Yêu cầu UserService tiến hành lưu vào Database
        userService.confirmRegistration(request.getEmail());

        // Do chưa login ngay nên có thể trả về một AuthResponse với thông báo thành công
        return AuthResponse.builder()
                .message("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.")
                .build();
    }
}