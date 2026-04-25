package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    PromotionResponse toResponse(PromotionEntity entity);

    @Mapping(target = "books", ignore = true)
    @Mapping(target = "id", ignore = true)
    PromotionEntity toEntity(PromotionRequest request);

    @Mapping(target = "slug", source = "slug")
    PromotionResponse.PromotionBookDto toPromotionBookDto(BookEntity book);

    @AfterMapping
    default void applyDiscountToBooks(PromotionEntity entity, @MappingTarget PromotionResponse response) {
        if (entity == null || response == null || response.getBooks() == null) return;
        LocalDateTime now = LocalDateTime.now();
        boolean isRunning = entity.getStatus() == PromotionStatus.ACTIVE && !entity.isDeleted() && !now.isBefore(entity.getStartDate()) && !now.isAfter(entity.getEndDate());
        for (PromotionResponse.PromotionBookDto book : response.getBooks()) {
            if (book.getOriginalPrice() != null && book.getOriginalPrice() > book.getSalePrice()) {
                book.setDiscount((int) Math.round(((book.getOriginalPrice() - book.getSalePrice()) / book.getOriginalPrice()) * 100));
            }
            if (isRunning && book.getSalePrice() != null) {
                double flashSalePrice;
                if ("PERCENTAGE".equals(entity.getDiscountType().name())) {
                    flashSalePrice = book.getSalePrice() - (book.getSalePrice() * entity.getDiscountValue() / 100.0);
                } else {
                    flashSalePrice = Math.max(0, book.getSalePrice() - entity.getDiscountValue());
                }
                book.setSalePrice(flashSalePrice);
                if (book.getOriginalPrice() != null && book.getOriginalPrice() > 0) {
                    book.setDiscount((int) Math.round(((book.getOriginalPrice() - flashSalePrice) / book.getOriginalPrice()) * 100));
                }
            }
        }
    }
}