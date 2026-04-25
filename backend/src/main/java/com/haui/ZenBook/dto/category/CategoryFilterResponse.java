package com.haui.ZenBook.dto.category;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryFilterResponse {
    private String id;
    private String name;
    private Long count;
}
