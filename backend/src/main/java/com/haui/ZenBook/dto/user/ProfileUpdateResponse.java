package com.haui.ZenBook.dto.user;

import com.haui.ZenBook.enums.UserStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponse {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private UserStatus status;
}
