package com.haui.ZenBook.dto.user;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileUpdateRequest {
    private String fullName;
    private String username;
    private String gender;
    private LocalDate dateOfBirth;
    private String nationality;

}