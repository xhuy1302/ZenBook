package com.haui.ZenBook.dto.book;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PriceRangeResponse {
    private Double minPrice;
    private Double maxPrice;
}