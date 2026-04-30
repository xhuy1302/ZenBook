package com.haui.ZenBook.dto.membership;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PointHistoryResponse {
    private String id;
    private String title;
    private String date;
    private Integer points;
    private String type; // "earn", "redeem", "gift"
}