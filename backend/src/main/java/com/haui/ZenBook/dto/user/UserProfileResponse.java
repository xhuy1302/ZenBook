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

    // Tên trường ở đây là avatarUrl để khớp với Frontend TypeScript
    // (Trong UserMapper mình đã có dòng @Mapping(target = "avatarUrl", source = "avatar") để xử lý)
    private String avatarUrl;

    // Danh sách quyền của user (ví dụ: ["USER", "ADMIN"])
    private List<String> roles;

}