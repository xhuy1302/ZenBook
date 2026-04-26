package com.haui.ZenBook.dto.review;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReviewResponse {
    private String id;
    private String userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String content;
    private List<ReviewImageResponse> images;   // ← thêm
    private ReviewReplyResponse reply;          // ← thêm
    private long helpfulVotes;                  // ← thêm
    private boolean isHelpfulByMe;              // ← thêm (set dựa vào currentUserId)
    private LocalDateTime createdAt;
}
