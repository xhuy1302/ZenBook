package com.haui.ZenBook.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReviewRequest {
    @NotNull(message = "Vui lòng chọn số sao đánh giá")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    private String content;
    // Lưu ý: Thông thường cập nhật đánh giá ít khi cho sửa ảnh để tránh phức tạp hệ thống,
    // hoặc bạn có thể bổ sung logic xóa/thêm ảnh sau này.
}