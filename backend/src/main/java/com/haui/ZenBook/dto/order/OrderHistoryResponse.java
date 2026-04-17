package com.haui.ZenBook.dto.order;


import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryResponse {
    private String id;
    private OrderStatus fromStatus;
    private OrderStatus toStatus;
    private String actionBy;
    private ActionRole role;
    private String note;
    private LocalDateTime createdAt;
}
