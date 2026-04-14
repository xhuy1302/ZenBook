package com.haui.ZenBook.dto.promotion;

import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.PromotionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PromotionRequest {

    @NotBlank(message = "Tên chương trình không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Mức giảm không được để trống")
    private Double discountValue;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

//    @NotNull(message = "Trạng thái không được để trống")
//    private PromotionStatus status;

    // Frontend chỉ cần gửi lên danh sách ID của các cuốn sách được chọn
    private List<String> bookIds;
}