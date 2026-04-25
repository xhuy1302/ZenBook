package com.haui.ZenBook.dto.receipt;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreviewReceiptResponse {
    private List<PreviewReceiptDetailResponse> details;
    private Double totalAmount;
    private Integer totalRows;
    private Integer validRows;
    private Integer invalidRows;
    @JsonProperty("isValidAll")
    private boolean isValidAll;
}
