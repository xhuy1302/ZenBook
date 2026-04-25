package com.haui.ZenBook.service;

import com.haui.ZenBook.entity.OrderEntity;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {
    String createVnPayUrl(OrderEntity order, HttpServletRequest request);
}