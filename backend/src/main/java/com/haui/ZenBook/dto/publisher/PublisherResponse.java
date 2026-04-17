package com.haui.ZenBook.dto.publisher;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.PublisherStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PublisherResponse {
    private String id;
    private String name;
    private String contactName;
    private String taxCode;
    private String email;
    private String phone;
    private String address;
    private String website;
    private String description;
    private PublisherStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}