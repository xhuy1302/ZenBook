package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderResponse;

import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest request, String actionBy, ActionRole role, String userId);
    OrderResponse updateOrder(String orderId, OrderUpdateRequest request, String actionBy, ActionRole role);
    OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus, String note, String actionBy, ActionRole role);
    Page<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);
    Page<OrderResponse> getMyOrders(String userId, Pageable pageable);
    OrderResponse getOrderById(String orderId);
    long countPendingOrders();
}