package com.haui.ZenBook.chatbot.service;

import com.haui.ZenBook.chatbot.tool.dto.AiBookDto;
import com.haui.ZenBook.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookSearchAiService {

    private final BookRepository bookRepository;

    @Cacheable(value = "ai_book_search", key = "T(java.util.Objects).hash(#keyword, #minPrice, #maxPrice)")
    public List<AiBookDto.SearchResponse> search(String keyword, Double minPrice, Double maxPrice) {

        // 1. Chuẩn hóa từ khóa
        String searchKey = (keyword != null) ? keyword.trim() : "";
        if (searchKey.equalsIgnoreCase("sách") || searchKey.equalsIgnoreCase("cuốn sách") || searchKey.equalsIgnoreCase("quyển sách")) {
            searchKey = "";
        }

        // 2. 👉 BẪY LỖI AI "NGÁO" GIÁ:
        // Nếu AI lỡ truyền 0.0, ta ép về null để Hibernate bỏ qua điều kiện này
        if (minPrice != null && minPrice <= 0.0) {
            minPrice = null;
        }
        if (maxPrice != null && maxPrice <= 0.0) {
            maxPrice = null;
        }

        // Bẫy lỗi Logic: Tránh trường hợp AI điền min = 100k, max = 0 (max nhỏ hơn min)
        if (minPrice != null && maxPrice != null && maxPrice < minPrice) {
            maxPrice = null; // Xóa luôn điều kiện maxPrice vô lý
        }

        // 3. Truy vấn Database an toàn
        return bookRepository.searchBooksWithPriceForAi(
                searchKey,
                minPrice,
                maxPrice,
                PageRequest.of(0, 5) // Chỉ lấy 5 quyển cho AI đỡ bị ngợp
        );
    }
}