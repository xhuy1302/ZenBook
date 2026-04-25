package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface BookService {
    BookResponse createBook(BookRequest request);
    List<BookResponse> getAllBooks();
    BookResponse updateBook(String id, BookRequest request);
    BookResponse getBookById(String id);
    BookResponse getBookBySlug(String slug);
    void deleteBook(String id);
    BookResponse updateStatus(String id, String status);

    List<BookResponse> getBooksInTrash();
    void restoreBook(String id);
    void hardDeleteBook(String id);

    List<BookResponse> getRecentBooks();
    List<BookResponse> getTrendingBooks();
    List<BookResponse> getAwardBooks();

    Page<BookResponse> getBooksWithFilterAndPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> categoryIds, List<String> authorIds, List<String> publisherIds,
            List<String> formats, List<String> languages, Integer minRating
    );

    void incrementViewCount(String id);

    Map<String, Double> getPriceRange();
}