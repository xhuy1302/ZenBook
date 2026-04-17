package com.haui.ZenBook.dto.author;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.AuthorStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorUpdateResponse {

    @NotBlank(message = "ID_NOTBLANK")
    private String id;
    private String name;
    private String nationality;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime dateOfBirth;
    private String biography;
    private AuthorStatus status;
}