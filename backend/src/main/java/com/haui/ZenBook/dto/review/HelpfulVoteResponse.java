package com.haui.ZenBook.dto.review;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HelpfulVoteResponse {
    private long helpfulVotes;
    private boolean isHelpful;
}