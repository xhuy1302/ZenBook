package com.haui.ZenBook.dto.category;

import com.haui.ZenBook.enums.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryUpdateRequest {

    @NotBlank(message = "category.name.not.blank")
    @Size(min = 2, max = 255, message = "category.name.invalid.size")
    String categoryName;

    // Cho phép sửa slug nếu admin muốn tối ưu SEO, nhưng vẫn check null ở Service
    String slug;

    @Size(max = 1000, message = "category.desc.too.long")
    String categoryDesc;

    // ID của danh mục cha mới (nếu muốn di chuyển danh mục)
    String parentId;

    String thumbnailUrl;

    Integer displayOrder;

    Boolean isFeatured;

    // Khác với Creation, Update thường cho phép thay đổi trạng thái trực tiếp
    CategoryStatus status;
}