package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.news.NewsRequest;
import com.haui.ZenBook.dto.news.NewsResponse;
import com.haui.ZenBook.entity.NewsEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NewsMapper {

    // Ánh xạ từ Request sang Entity (Tạo mới)
    // Cố tình bỏ qua các ID quan hệ vì ta sẽ findById() ở dưới Service rồi mới set vào
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "books", ignore = true)
    NewsEntity toEntity(NewsRequest request);

    // Ánh xạ từ Entity sang Response (Trả về Client)
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.fullName") // Hoặc author.username tùy bạn
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.categoryName")
    NewsResponse toResponse(NewsEntity entity);

    // Cập nhật Entity từ Request (Update)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "books", ignore = true)
    void updateEntity(@MappingTarget NewsEntity entity, NewsRequest request);
}