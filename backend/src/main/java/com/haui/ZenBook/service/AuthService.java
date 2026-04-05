package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.auth.AuthResponse;
import com.haui.ZenBook.dto.auth.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}