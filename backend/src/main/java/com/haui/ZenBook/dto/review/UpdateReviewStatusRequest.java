package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReviewStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private ReviewStatus status;
}