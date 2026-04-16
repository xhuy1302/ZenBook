package com.haui.ZenBook.dto.book;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookImageResponse {
    private String id;
    private String imageUrl;
}
