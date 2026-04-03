package com.haui.ZenBook.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryCreationRequest {

    @NotBlank(message = "CATEGORY_NAME_REQUIRED")
    @Size(min = 2, max = 255, message = "INVALID_CATEGORY_NAME_SIZE")
    String categoryName;

    String slug;

    @Size(max = 1000, message = "DESCRIPTION_TOO_LONG")
    String categoryDesc;

    String parentId;

    Integer displayOrder;

    String thumbnailUrl;

    @NotNull(message = "FEATURED_STATUS_REQUIRED")
    Boolean isFeatured;
}