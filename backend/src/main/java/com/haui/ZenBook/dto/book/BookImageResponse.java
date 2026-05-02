package com.haui.ZenBook.dto.book;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor  // 👉 BẮT BUỘC: Tạo Constructor không đối số cho Jackson
@AllArgsConstructor
public class BookImageResponse implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private String id;
    private String imageUrl;
}
