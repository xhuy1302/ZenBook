package com.haui.ZenBook.dto.dashboard.Metrics;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MetricItem {
    private String value;  // VD: "1.62 tỷ" hoặc "3,240"
    private String change; // VD: "+23.4%"
    private boolean up;    // true nếu tăng, false nếu giảm
}