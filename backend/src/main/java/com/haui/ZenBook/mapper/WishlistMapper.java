package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.wishlist.WishlistResponse;
import com.haui.ZenBook.entity.WishlistEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WishlistMapper {

    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.title", target = "title")
    @Mapping(source = "book.originalPrice", target = "originalPrice")
    @Mapping(source = "book.stockQuantity", target = "stockQuantity")
    @Mapping(source = "book.soldQuantity", target = "soldQuantity")
    @Mapping(source = "book.status", target = "status")
    @Mapping(source = "book.slug", target = "slug")
    @Mapping(source = "book.thumbnail", target = "thumbnail")
    @Mapping(target = "salePrice", ignore = true)
    @Mapping(target = "discount", ignore = true)
    WishlistResponse toResponse(WishlistEntity entity);

    // 🔥 Đã xóa @AfterMapping calculatePriceAndDiscount để đẩy việc đó ra Service
}