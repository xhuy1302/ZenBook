package com.haui.ZenBook.dto.wishlist;

import com.haui.ZenBook.enums.BookStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class WishlistResponse {
    private String bookId;
    private String title;
    private String slug;
    private Double salePrice;
    Double originalPrice;
    Integer stockQuantity;
    Integer soldQuantity;
    BookStatus status;
    private Integer discount;
    private String thumbnail;
}