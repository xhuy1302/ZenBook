package com.haui.ZenBook.dto.author;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class AuthorCreationRequest {
    @NotBlank(message = "AUTHOR_NAME_NOTBLANK")
    private String name;
    @NotBlank(message = "AUTHOR_NAME_NOTBLANK")
    private String nationality;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime dateOfBirth;
    private String biography;
}