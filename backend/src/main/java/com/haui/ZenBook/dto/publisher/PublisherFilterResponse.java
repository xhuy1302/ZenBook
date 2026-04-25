package com.haui.ZenBook.dto.publisher;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublisherFilterResponse {
    private String id;
    private String name;
    private Long count;
}
