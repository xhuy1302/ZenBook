package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("adminBookController") // Phân biệt Bean với Customer
@RequestMapping("/api/v1/admin/books") // Thêm /admin để không đụng URL với Customer
@RequiredArgsConstructor
@Slf4j
public class BookController {

    private final BookService bookService;
    private final MessageSource messageSource; // Tiêm MessageSource để xử lý đa ngôn ngữ

    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> createBook(@ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.createBook(request))
                .message(messageSource.getMessage("book.create.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> updateBook(
            @PathVariable String id,
            @ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateBook(id, request))
                .message(messageSource.getMessage("book.update.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BookResponse> getBook(@PathVariable String id) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookById(id))
                .message(messageSource.getMessage("book.get.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<BookResponse> getBookBySlug(@PathVariable String slug) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookBySlug(slug))
                .message(messageSource.getMessage("book.get.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping
    public ApiResponse<List<BookResponse>> getAllBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getAllBooks())
                .message(messageSource.getMessage("book.get_all.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("book.delete.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<BookResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateStatus(id, status))
                .message(messageSource.getMessage("book.update_status.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<BookResponse>> getBooksInTrash() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getBooksInTrash())
                .message(messageSource.getMessage("book.get_trash.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restoreBook(@PathVariable String id) {
        bookService.restoreBook(id);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("book.restore.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    @DeleteMapping("/hard-delete/{id}")
    public ApiResponse<Void> hardDeleteBook(@PathVariable String id) {
        bookService.hardDeleteBook(id);
        return ApiResponse.<Void>builder()
                .message(messageSource.getMessage("book.hard_delete.success", null, LocaleContextHolder.getLocale()))
                .build();
    }
}