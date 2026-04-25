package com.haui.ZenBook.dto.receipt;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreviewReceiptDetailResponse {
    private Integer rowNumber;
    private String bookId;
    private String bookTitle;
    private String thumbnail;
    private Integer quantity;
    private Double importPrice;
    private Double salePrice; // Trả về để người dùng đối chiếu
    private Double subTotal;
    @JsonProperty("isValid")
    private boolean isValid;
    private List<String> errorMessages;
}
