package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.order.OrderDetailResponse;
import com.haui.ZenBook.dto.order.OrderHistoryResponse;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.entity.OrderDetailEntity;
import com.haui.ZenBook.entity.OrderHistoryEntity;
import com.haui.ZenBook.entity.OrderEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // 1. Map Entity Đơn hàng -> DTO Đơn hàng
    // Chỉ mapping những trường có tên KHÁC NHAU giữa Entity và DTO
    @Mapping(source = "userId", target = "userId") // Sửa từ user.id thành userId theo gợi ý của lỗi

    // Nếu trong Entity bạn đặt tên là 'code' nhưng DTO là 'orderCode' thì mở comment dòng dưới:
    // @Mapping(source = "code", target = "orderCode")

    // Nếu trong Entity bạn đặt tên là 'totalAmount' nhưng DTO là 'finalTotal' thì mở comment dòng dưới:
    // @Mapping(source = "totalAmount", target = "finalTotal")

    OrderResponse toOrderResponse(OrderEntity entity);

    // 2. Map Entity Chi tiết -> DTO Chi tiết
    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.title", target = "bookTitle")
    @Mapping(source = "book.thumbnail", target = "bookImage")
    OrderDetailResponse toOrderDetailResponse(OrderDetailEntity entity);

    // 3. Map Entity Lịch sử -> DTO Lịch sử
    OrderHistoryResponse toOrderHistoryResponse(OrderHistoryEntity entity);
}