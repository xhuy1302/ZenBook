package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.BookImageEntity;
import com.haui.ZenBook.entity.BookSpecificationEntity;
import org.mapstruct.*;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, AuthorMapper.class, PublisherMapper.class, TagMapper.class})
public interface BookMapper {

    // --- MAPPING TỪ REQUEST SANG ENTITY (Tạo mới) ---
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "status", source = "status")
    @Mapping(target = "specification", expression = "java(mapToSpecification(request))")
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "authors", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "publisher", ignore = true) // 👉 THÊM: Bỏ qua publisher để set thủ công trong tầng Service
    BookEntity toEntity(BookRequest request);

    // --- MAPPING TỪ ENTITY SANG RESPONSE ---
    @Mapping(target = "format", source = "specification.format")
    @Mapping(target = "pageCount", source = "specification.pageCount")
    @Mapping(target = "publicationYear", source = "specification.publicationYear")
    @Mapping(target = "dimensions", source = "specification.dimensions")
    @Mapping(target = "weight", source = "specification.weight")
    @Mapping(target = "language", source = "specification.language")
    @Mapping(target = "images", source = "images", qualifiedByName = "extractImageUrls")
    // MapStruct sẽ tự động map `PublisherEntity` sang `PublisherResponse` vì đã có PublisherMapper
    BookResponse toResponse(BookEntity entity);

    // --- CÁC HÀM XỬ LÝ PHỤ ---
    @Named("mapToSpecification")
    default BookSpecificationEntity mapToSpecification(BookRequest request) {
        if (request == null) return null;
        return BookSpecificationEntity.builder()
                .format(request.getFormat())
                .pageCount(request.getPageCount())
                .publicationYear(request.getPublicationYear())
                .dimensions(request.getDimensions())
                .weight(request.getWeight())
                .language(request.getLanguage())
                .build();
    }

    @Named("extractImageUrls")
    default Set<String> extractImageUrls(Set<BookImageEntity> images) {
        if (images == null) return Collections.emptySet();
        return images.stream()
                .map(BookImageEntity::getImageUrl)
                .collect(Collectors.toSet());
    }

    // --- HÀM CẬP NHẬT (UPDATE) ---
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "authors", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "publisher", ignore = true) // 👉 THÊM: Bỏ qua publisher khi update
    @Mapping(target = "specification", ignore = true)
    void updateEntityFromRequest(BookRequest request, @MappingTarget BookEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "book", ignore = true)
    void updateSpecificationFromRequest(BookRequest request, @MappingTarget BookSpecificationEntity specification);

    @AfterMapping
    default void handleNestedUpdate(BookRequest request, @MappingTarget BookEntity entity) {
        if (request == null) return;

        if (entity.getSpecification() == null) {
            BookSpecificationEntity newSpec = new BookSpecificationEntity();
            newSpec.setBook(entity);
            entity.setSpecification(newSpec);
        }

        updateSpecificationFromRequest(request, entity.getSpecification());
    }
}