package com.haui.ZenBook.dto.review;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

@Data
@Builder
public class PagedReviewResponse {
    private Page<ReviewResponse> reviews;
    private RatingStatsResponse stats;
}
