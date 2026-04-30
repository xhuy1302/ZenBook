package com.haui.ZenBook.dto.membership;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberInfoResponse {
    private String name;
    private String memberId;
    private Integer points;
    private String tier; // "leaf", "silver", "gold", "diamond" - khớp với React UI
    private Integer totalOrders;
    private String memberSince;
    private Integer yearPoints;
    private Double totalSaved;
    private Double totalSpending;
    private int currentStreak;
    private boolean isCheckedInToday;
}