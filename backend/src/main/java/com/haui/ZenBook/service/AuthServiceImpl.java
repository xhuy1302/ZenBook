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
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    public AuthResponse login(LoginRequest request) {
        // authenticationManager tự động quăng lỗi nếu sai thông tin
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, request.getEmail()));

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }
}