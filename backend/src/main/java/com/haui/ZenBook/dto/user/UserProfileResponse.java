package com.haui.ZenBook.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String id;

    private String username;

    private String email;

    private String fullName;

    private String phone;

    private String gender;

    private LocalDate dateOfBirth;

    private String nationality;

    private String avatarUrl;

    private List<String> roles;

}