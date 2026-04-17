package com.haui.ZenBook.dto.publisher;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublisherCreationRequest {
    @NotBlank(message = "PUBLISHER_NAME_NOT_BLANK") // Sửa lại message cho chuẩn
    private String name;

    private String contactName;
    private String taxCode;

    @Email(message = "EMAIL_VALID")
    private String email;

    private String phone;
    private String address;
    private String website;
    private String description;
}