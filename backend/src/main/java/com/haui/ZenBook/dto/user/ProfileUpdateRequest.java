package com.haui.ZenBook.dto.user;

import com.haui.ZenBook.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    @NotBlank(message = "USERNAME_NOTBLANK")
    private String username;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
    private Set<String> roles;
}
