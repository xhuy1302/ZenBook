package com.haui.ZenBook.dto.order;

import com.haui.ZenBook.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatus newStatus;

    private String note; // Lý do hủy đơn hoặc ghi chú cập nhật
}
