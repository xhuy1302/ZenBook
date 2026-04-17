package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.tag.TagRequest;
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.entity.TagEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TagMapper {

    // 1. Chuyển từ Entity sang Response
    TagResponse toResponse(TagEntity entity);

    // 2. Chuyển từ Request sang Entity (Khi Thêm Mới)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // Dành cho JpaAuditing tự sinh
    @Mapping(target = "updatedAt", ignore = true)
    TagEntity toEntity(TagRequest request);

    // 3. Cập nhật Entity có sẵn từ Request (Khi Sửa)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true) // RẤT QUAN TRỌNG: Không để Request đè null làm mất ngày tạo cũ
    @Mapping(target = "updatedAt", ignore = true)
    // 👉 LƯU Ý: Chữ @MappingTarget phải luôn nằm ở tham số Entity (Đích đến)
    void updateEntity(@MappingTarget TagEntity entity, TagRequest request);
}