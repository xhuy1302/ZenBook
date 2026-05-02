package com.haui.ZenBook.dto.AiRecommendation;

import com.haui.ZenBook.dto.book.BookResponse;

import java.util.List;

// Record mặc định đã có khả năng Serializable
public record RecommendationSectionDto(
        String title,
        List<BookResponse> books
) implements java.io.Serializable { // Vẫn nên ghi rõ ra để IDE không cảnh báo nhầm
    // 👉 serialVersionUID phải nằm ở đây, bên trong dấu ngoặc nhọn
    private static final long serialVersionUID = 1L;
}