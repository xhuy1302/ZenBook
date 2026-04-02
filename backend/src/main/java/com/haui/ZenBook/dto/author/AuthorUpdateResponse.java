package com.haui.ZenBook.dto.author;

import com.haui.ZenBook.enums.AuthorStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorUpdateResponse {

    @NotBlank(message = "ID_NOTBLANK")
    private String id;

    private String name;

    private String email;

    private String biography;

    private AuthorStatus status;
}