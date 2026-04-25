package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.cart.CartDetailResponse;
import com.haui.ZenBook.dto.cart.CartResponse;
import com.haui.ZenBook.entity.CartDetailEntity;
import com.haui.ZenBook.entity.CartEntity;
import com.haui.ZenBook.entity.AuthorEntity; // Thêm import này nếu cần
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface CartMapper {

    CartResponse toCartResponse(CartEntity entity);

    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.slug", target = "bookSlug")
    @Mapping(source = "book.title", target = "bookTitle")
    @Mapping(source = "book.thumbnail", target = "bookThumbnail")
    @Mapping(source = "book.salePrice", target = "price")
    @Mapping(source = "book.originalPrice", target = "originalPrice")
    @Mapping(source = "book.stockQuantity", target = "stock")
    @Mapping(target = "author", expression = "java(entity.getBook().getAuthors() == null || entity.getBook().getAuthors().isEmpty() ? \"\" : entity.getBook().getAuthors().iterator().next().getName())")
    CartDetailResponse toCartDetailResponse(CartDetailEntity entity);

    List<CartDetailResponse> toCartDetailResponseList(List<CartDetailEntity> entities);
}