package com.haui.ZenBook.dto.news;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.NewsStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NewsResponse {

    private String id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String thumbnail;
    private NewsStatus status;
    private Integer viewCount;

    // SEO
    private String metaTitle;
    private String metaDescription;

    // Thông tin người viết và danh mục (Chỉ cần trả về tên và ID cho nhẹ)
    private String authorId;
    private String authorName;
    private String categoryId;
    private String categoryName;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime publishedAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime deletedAt;
}