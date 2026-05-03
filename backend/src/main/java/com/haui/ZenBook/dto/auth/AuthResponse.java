package com.haui.ZenBook.dto.auth;

import com.haui.ZenBook.dto.user.UserResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthResponse {
    private String token;
    private UserResponse user;

    private String message;
}