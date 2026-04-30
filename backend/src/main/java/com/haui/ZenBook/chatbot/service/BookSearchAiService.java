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

    // Cache kết quả tìm kiếm trong vòng 10-30 phút
    @Cacheable(value = "ai_book_search", key = "#keyword.toLowerCase().trim()")
    public List<AiBookDto.SearchResponse> search(String keyword) {
        // Chỉ lấy 5 cuốn phù hợp nhất, giảm tải tối đa cho AI
        return bookRepository.searchBooksForAi(keyword, PageRequest.of(0, 5));
    }
}