package com.haui.ZenBook.dto.publisher;

import com.haui.ZenBook.enums.PublisherStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublisherUpdateRequest {
    private String name;
    private String contactName;
    private String taxCode;
    private String email;
    private String phone;
    private String address;
    private String website;
    private String description;
    private PublisherStatus status;
}