package com.haui.ZenBook.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierCreationRequest {
    @NotBlank(message = "SUPPLIER_NAME_NOT_BLANK")
    private String name;

    private String contactName;
    private String taxCode;

    @Email(message = "EMAIL_VALID")
    private String email;

    private String phone;
    private String address;
    private String description;
}