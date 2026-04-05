package com.haui.ZenBook.dto.book;

import com.haui.ZenBook.dto.author.AuthorResponse;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.enums.BookFormat;
import com.haui.ZenBook.enums.BookStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookResponse {
    String id;
    String title;
    String slug;
    String isbn;
    String description;
    Double originalPrice;
    Double salePrice;
    Integer stockQuantity;
    Integer soldQuantity;
    String thumbnail;
    BookStatus status;
    LocalDateTime createdAt;

    // Thông tin chi tiết các liên kết
    SupplierResponse supplier;
    Set<CategoryResponse> categories;
    Set<AuthorResponse> authors;
    Set<TagResponse> tags;

    // Thông số kỹ thuật
    BookFormat format;
    Integer pageCount;
    Integer publicationYear;
    String dimensions;
    Integer weight;
    String language;

    // Danh sách ảnh phụ
    Set<String> images;
}