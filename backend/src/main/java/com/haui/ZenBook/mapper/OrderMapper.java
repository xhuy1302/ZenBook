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

    // Map Entity Đơn hàng -> DTO Đơn hàng
    OrderResponse toOrderResponse(OrderEntity entity);

    // Map Entity Chi tiết -> DTO Chi tiết
    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.title", target = "bookTitle")
    @Mapping(source = "book.thumbnail", target = "bookImage") // <-- ĐÃ SỬA CHUẨN THEO ENTITY CỦA CƯNG
    OrderDetailResponse toOrderDetailResponse(OrderDetailEntity entity);

    // Map Entity Lịch sử -> DTO Lịch sử
    OrderHistoryResponse toOrderHistoryResponse(OrderHistoryEntity entity);
}