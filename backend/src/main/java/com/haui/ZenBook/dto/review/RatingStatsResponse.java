package com.haui.ZenBook.dto.review;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class RatingStatsResponse {
    private double average;
    private long count;
    private Map<Integer, Long> breakdown; // key 1-5
}
