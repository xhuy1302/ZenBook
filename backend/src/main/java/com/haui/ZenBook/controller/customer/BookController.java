package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController("customerBookController")
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {

    private final BookService bookService;
    private final MessageSource messageSource;

    @GetMapping("/recent")
    public ApiResponse<List<BookResponse>> getRecentBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getRecentBooks())
                .message(messageSource.getMessage("book.get_recent.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping("/trending")
    public ApiResponse<List<BookResponse>> getTrendingBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getTrendingBooks())
                .message(messageSource.getMessage("book.get_trending.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping("/awards")
    public ApiResponse<List<BookResponse>> getAwardBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getAwardBooks())
                .message(messageSource.getMessage("book.get_awards.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    // Đổi tên biến thành slugOrId cho chuẩn ngữ nghĩa
    @GetMapping("/{slugOrId}")
    public ApiResponse<BookResponse> getBookDetails(@PathVariable String slugOrId) {
        BookResponse book;

        try {
            // 1. Ưu tiên thử tìm theo Slug trước
            book = bookService.getBookBySlug(slugOrId);
        } catch (Exception e) {
            // 2. Nếu tìm Slug không thấy (bắn lỗi Not Found), tự động quay xe tìm theo ID
            book = bookService.getBookById(slugOrId);
        }

        return ApiResponse.<BookResponse>builder()
                .data(book)
                .message(messageSource.getMessage("book.get_detail.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<BookResponse>> getBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> categoryIds,
            @RequestParam(required = false) List<String> authorIds,
            @RequestParam(required = false) List<String> publisherIds,
            @RequestParam(required = false) List<String> formats,
            @RequestParam(required = false) List<String> languages,
            @RequestParam(required = false) Integer minRating
    ) {
        Page<BookResponse> result = bookService.getBooksWithFilterAndPagination(
                page, size, sortBy, sortDir, keyword, minPrice, maxPrice,
                categoryIds, authorIds, publisherIds, formats, languages, minRating
        );

        return ApiResponse.<Page<BookResponse>>builder()
                .data(result)
                .message("Lấy danh sách sách thành công")
                .build();
    }

    @GetMapping("/id/{id}")
    public ApiResponse<BookResponse> getBookById(@PathVariable String id) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookById(id))
                .message("Lấy chi tiết sách thành công")
                .build();
    }

    @PostMapping("/{id}/view")
    public ApiResponse<Void> incrementViewCount(@PathVariable String id) {
        bookService.incrementViewCount(id);
        return ApiResponse.<Void>builder()
                .message("Tăng lượt xem thành công")
                .build();
    }

    @GetMapping("/price-range")
    public ResponseEntity<?> getPriceRange() {
        // Logic lấy min, max giá sách từ database
        return ResponseEntity.ok(bookService.getPriceRange());
    }
}