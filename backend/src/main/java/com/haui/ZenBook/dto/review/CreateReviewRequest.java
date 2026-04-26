package com.haui.ZenBook.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateReviewRequest {
    @NotNull(message = "Vui lòng chọn số sao đánh giá")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    private String content;

    // Nhận mảng URL ảnh sau khi client đã gọi API upload lên S3
    private List<String> imageUrls;

    @NotNull(message = "Thiếu order detail id")
    private String orderDetailId;
}