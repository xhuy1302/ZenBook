package com.haui.ZenBook.dto.book;

import com.haui.ZenBook.enums.BookFormat;
import com.haui.ZenBook.enums.BookStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookRequest {
    String title;
    String isbn;
    String description;
    Double originalPrice;
    Double salePrice;
    Integer stockQuantity;
    BookStatus status;

    // File ảnh từ Form-data
    MultipartFile thumbnailFile;
    List<MultipartFile> galleryFiles;

    // Các ID quan hệ
    String publisherId; // 👉 THÊM MỚI: ID của Nhà xuất bản
    Set<String> categoryIds;
    Set<String> authorIds;
    Set<String> tagIds;

    // Thông số
    BookFormat format;
    Integer pageCount;
    Integer publicationYear;
    String dimensions;
    Integer weight;
    String language;

    @Builder.Default
    List<String> deleteImageIds = new ArrayList<>(); // ID ảnh cần xóa
}