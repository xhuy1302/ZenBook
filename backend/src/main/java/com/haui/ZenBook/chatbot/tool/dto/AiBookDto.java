package com.haui.ZenBook.chatbot.tool.dto;

public class AiBookDto {

    // 👉 BẮT BUỘC ĐÚNG THỨ TỰ: id, title, price, stock, slug
    public record SearchResponse(
            String id,         // 1. Khớp với b.id
            String title,      // 2. Khớp với b.title
            Double price,      // 3. Khớp với b.salePrice
            Integer stock,     // 4. Khớp với b.stockQuantity
            String slug        // 5. Khớp với b.slug
    ) implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
    }
}