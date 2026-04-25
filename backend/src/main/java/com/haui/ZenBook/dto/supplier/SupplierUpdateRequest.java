package com.haui.ZenBook.dto.supplier;

import com.haui.ZenBook.enums.SupplierStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplierUpdateRequest {
    private String name;
    private String contactName;
    private String taxCode;
    private String email;
    private String phone;
    private String address;
    private String description;
    private SupplierStatus status;
}