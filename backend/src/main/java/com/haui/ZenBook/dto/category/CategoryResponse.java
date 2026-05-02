package com.haui.ZenBook.dto.category;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.haui.ZenBook.enums.CategoryStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse implements java.io.Serializable {

    private static final long serialVersionUID = 1L;
    private String id;
    private String categoryName;
    private String slug;
    private String categoryDesc;
    private String parentId;
    private Integer level;
    private String thumbnailUrl;
    private Integer displayOrder;
    private Boolean isFeatured;
    private CategoryStatus status;

    private List<CategoryResponse> children;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;
}