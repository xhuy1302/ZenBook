package com.haui.ZenBook.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreationRequest {
    @NotBlank(message = "USERNAME_NOTBLANK")
    private String username;
    @Email(message = "EMAIL_VALID")
    @NotBlank(message = "EMAIL_NOTBLANK")
    private String email;
    @Size(min = 8, message = "PASSWORD_INVALID")
    private String password;
}
