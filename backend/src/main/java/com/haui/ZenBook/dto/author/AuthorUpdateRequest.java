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
public class AuthorUpdateRequest {

    @NotBlank(message = "AUTHOR_NAME_NOTBLANK")
    private String name;

    private String avatar;

    private String biography;

    private AuthorStatus status;
}