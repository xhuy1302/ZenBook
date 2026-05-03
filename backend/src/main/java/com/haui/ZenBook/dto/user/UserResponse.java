package com.haui.ZenBook.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.dto.membership.MemberInfoResponse;
import com.haui.ZenBook.enums.UserStatus;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
    private Set<String> roles;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
//    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime deletedAt;

    private MemberInfoResponse membership;

    @Data
    public static class MemberInfoResponse {
        private String tier;
        private Integer availablePoints;
        private Double totalSpending;
    }
}
