package com.haui.ZenBook.dto.tag;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {
    private String id;
    private String name;
    private String slug;
    private String color;
}