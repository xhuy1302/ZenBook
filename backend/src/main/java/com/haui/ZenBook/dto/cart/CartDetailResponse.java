package com.haui.ZenBook.dto.cart;

import lombok.Data;

@Data
public class CartDetailResponse {
    private String id;
    private String bookId;
    private String bookSlug;
    private String bookTitle;
    private String bookThumbnail;
    private Double price;         // salePrice hiện tại
    private Double originalPrice;  // Giá gốc để gạch ngang
    private String author;
    private Integer quantity;
    private Integer stock;         // Để FE chặn nếu mua quá kho
}