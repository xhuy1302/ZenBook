package com.haui.ZenBook.dto.news;

import com.haui.ZenBook.enums.NewsStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class NewsRequest {

    @NotBlank(message = "TITLE_NOTBLANK")
    private String title;

    private String summary;

    @NotBlank(message = "CONTENT_NOTBLANK")
    private String content;

    private NewsStatus status;

    // ID của Category và Author
    private String categoryId;

    // Danh sách ID của Tags và Books đính kèm
    private Set<String> tagIds;
    private Set<String> bookIds;

    // SEO
    private String metaTitle;
    private String metaDescription;
}