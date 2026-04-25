package com.haui.ZenBook.dto.author;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Quan trọng để dùng trong Query
public class AuthorFilterResponse {
    private String id;
    private String name;
    private Long count; // Trả về số lượng sách
}