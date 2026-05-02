package com.haui.ZenBook.dto.order;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    private String id;
    private String bookId;
    private String bookSlug;
    private String bookTitle; // Trả về thêm tên sách để Frontend đỡ phải gọi API phụ
    private String bookImage; // Trả về hình ảnh bìa sách để hiển thị cho đẹp
    private Integer quantity;
    private Double priceAtPurchase;
    private Double subTotal;
    private Boolean isReviewed;
}