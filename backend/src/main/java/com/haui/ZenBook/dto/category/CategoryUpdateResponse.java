package com.haui.ZenBook.dto.category;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.ZenBook.enums.CategoryStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryUpdateResponse {
    String id;
    String categoryName;
    String slug;
    String categoryDesc;
    String parentId;
    Integer level;
    String thumbnailUrl;
    Integer displayOrder;
    Boolean isFeatured;
    CategoryStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    LocalDateTime updatedAt;
}