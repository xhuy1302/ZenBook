package com.haui.ZenBook.chatbot.tool.dto;

public class OrderToolDto {
    public record OrderRequest(String orderCode) {}
    public record OrderResponse(String orderCode, String status, Double totalAmount, String expectedDeliveryDate) {}
}