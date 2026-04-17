package com.haui.ZenBook.dto.author;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.AuthorStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class AuthorResponse {

    private String id;

    private String name;

    private String avatar;

    private String nationality;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime dateOfBirth;

    private String email;

    private String biography;

    private AuthorStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    private int bookCount;
}