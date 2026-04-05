package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.auth.AuthResponse;
import com.haui.ZenBook.dto.auth.LoginRequest;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.UserMapper;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService { // Thêm implements AuthService

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    public AuthResponse login(LoginRequest request) {
        // 1. Kiểm tra User/Pass, nếu sai Spring Security sẽ tự động văng lỗi AuthenticationException
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Lấy thông tin UserEntity từ Database
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 3. Tạo JWT Token
        String jwtToken = jwtService.generateToken(user);

        // 4. Trả về Token kèm thông tin Profile của User đã được map qua DTO
        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }
}