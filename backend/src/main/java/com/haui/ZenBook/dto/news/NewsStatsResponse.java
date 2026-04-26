package com.haui.ZenBook.dto.news;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NewsStatsResponse {
    private long totalPosts;
    private long trendingPosts;
    private long totalViews;
}