package com.haui.ZenBook.dto.book;

import com.haui.ZenBook.dto.author.AuthorResponse;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.dto.publisher.PublisherResponse; // 👉 THÊM MỚI: Import PublisherResponse
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.enums.BookFormat;
import com.haui.ZenBook.enums.BookStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
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
    LocalDateTime updatedAt;

    // Thông tin chi tiết các liên kết
    PublisherResponse publisher; // 👉 THÊM MỚI: Trả về thông tin Nhà xuất bản
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


    private Double rating;
    private Integer totalReviews;
    private Integer views;
    private String award;
    private Integer discount;

    // Danh sách ảnh phụ
    private List<BookImageResponse> images;
}