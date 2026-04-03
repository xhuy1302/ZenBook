package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.category.CategoryCreationRequest;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.dto.category.CategoryUpdateRequest;
import com.haui.ZenBook.dto.category.CategoryUpdateResponse;
import com.haui.ZenBook.entity.CategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    // 1. Chuyển từ CreationRequest sang Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "level", ignore = true)
    CategoryEntity toEntity(CategoryCreationRequest request);

    CategoryResponse toResponse(CategoryEntity entity);

    CategoryUpdateResponse toUpdateResponse(CategoryEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "level", ignore = true)

    void updateCategory(@MappingTarget CategoryEntity entity, CategoryUpdateRequest request);
}