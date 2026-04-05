package com.haui.ZenBook.dto.supplier;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.SupplierStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SupplierResponse {
    private String id;
    private String name;
    private String contactName;
    private String taxCode;
    private String email;
    private String phone;
    private String address;
    private String website;
    private String description;
    private SupplierStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}