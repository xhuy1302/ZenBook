package com.haui.ZenBook.dto.auth;

import com.haui.ZenBook.dto.user.UserCreationRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingRegistration {
    private UserCreationRequest request; // Thông tin khách hàng điền trên Form đăng ký
    private String otpCode;
    private LocalDateTime expiryTime;
}