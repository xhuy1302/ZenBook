package com.haui.ZenBook.dto.author;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthorCreationRequest {

    @NotBlank(message = "AUTHOR_NAME_NOTBLANK")
    private String name;

    @Email(message = "EMAIL_VALID")
    @NotBlank(message = "EMAIL_NOTBLANK")
    private String email;

    private String biography;
}