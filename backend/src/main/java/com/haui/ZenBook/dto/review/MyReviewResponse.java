package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MyReviewResponse {
    private String id;
    private Integer rating;
    private String content;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private long helpfulVotes;
    private List<ReviewImageResponse> images;
    private ReviewReplyResponse reply;

    private String bookSlug;
    private String bookId;
    private String bookTitle;
    private String bookThumbnail;
    private String orderCode;
}
