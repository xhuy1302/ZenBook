package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.book.BookImageResponse;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.BookImageEntity;
import com.haui.ZenBook.entity.BookSpecificationEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import org.mapstruct.*;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, AuthorMapper.class, PublisherMapper.class, TagMapper.class})
public interface BookMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "specification", expression = "java(mapToSpecification(request))")
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "authors", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "publisher", ignore = true)
    BookEntity toEntity(BookRequest request);

    @Mapping(target = "format", source = "specification.format")
    @Mapping(target = "pageCount", source = "specification.pageCount")
    @Mapping(target = "publicationYear", source = "specification.publicationYear")
    @Mapping(target = "dimensions", source = "specification.dimensions")
    @Mapping(target = "weight", source = "specification.weight")
    @Mapping(target = "language", source = "specification.language")
    @Mapping(target = "images", source = "images", qualifiedByName = "extractImageResponses")
    BookResponse toResponse(BookEntity entity);

    @AfterMapping
    default void calculateLivePrice(BookEntity entity, @MappingTarget BookResponse response) {
        if (entity == null || response == null) return;
        double original = entity.getOriginalPrice() != null ? entity.getOriginalPrice() : 0;
        double baseSale = entity.getSalePrice() != null ? entity.getSalePrice() : 0;
        double bestPrice = baseSale;
        LocalDateTime now = LocalDateTime.now();

        if (entity.getPromotions() != null && !entity.getPromotions().isEmpty()) {
            for (PromotionEntity promo : entity.getPromotions()) {
                if (!promo.isDeleted() && promo.getStatus() == PromotionStatus.ACTIVE && !now.isBefore(promo.getStartDate()) && !now.isAfter(promo.getEndDate())) {
                    double discount = 0;
                    if ("PERCENTAGE".equals(promo.getDiscountType().name())) {
                        discount = baseSale * (promo.getDiscountValue() / 100.0);
                    } else {
                        discount = promo.getDiscountValue();
                    }
                    double promoPrice = Math.max(baseSale - discount, 0);
                    if (promoPrice < bestPrice) bestPrice = promoPrice;
                }
            }
        }
        response.setSalePrice(bestPrice);
        if (original > 0) {
            response.setDiscount((int) Math.round(((original - bestPrice) / original) * 100));
        }
    }

    @Named("mapToSpecification")
    default BookSpecificationEntity mapToSpecification(BookRequest request) {
        if (request == null) return null;
        return BookSpecificationEntity.builder().format(request.getFormat()).pageCount(request.getPageCount()).publicationYear(request.getPublicationYear()).dimensions(request.getDimensions()).weight(request.getWeight()).language(request.getLanguage()).build();
    }

    @Named("extractImageResponses")
    default List<BookImageResponse> extractImageResponses(Set<BookImageEntity> images) {
        if (images == null) return Collections.emptyList();
        return images.stream().map(img -> BookImageResponse.builder().id(img.getId()).imageUrl(img.getImageUrl()).build()).collect(Collectors.toList());
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "images", ignore = true)
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