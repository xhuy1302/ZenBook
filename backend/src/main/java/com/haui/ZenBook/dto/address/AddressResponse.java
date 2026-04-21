package com.haui.ZenBook.dto.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private String id;

    private String recipientName;

    private String phone;

    private String street;

    private String ward;

    private String district;

    private String city;

    private boolean isDefault;
}