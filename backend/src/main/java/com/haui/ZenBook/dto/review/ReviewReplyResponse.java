package com.haui.ZenBook.dto.review;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewReplyResponse {
    private String id;
    private String reviewId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String repliedById;
    private String repliedByFullName;
}