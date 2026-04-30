package com.haui.ZenBook.chatbot.tool.dto;

public class AiBookDto {
    public record SearchResponse(
            String id,
            String title,
            Double price,
            Integer stock
    ) {}
}