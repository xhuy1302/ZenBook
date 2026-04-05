package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.tag.TagRequest; // Nếu bạn có làm CRUD cho Tag riêng
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.entity.TagEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TagMapper {

    // Chuyển từ Entity sang Response để trả về cho Frontend
    TagResponse toResponse(TagEntity entity);

    // Nếu bạn có Request để tạo Tag riêng
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    TagEntity toEntity(TagRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntity(TagRequest request, @MappingTarget TagEntity entity);
}