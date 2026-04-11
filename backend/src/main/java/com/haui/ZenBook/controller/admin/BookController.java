package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {

    private final BookService bookService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> createBook(@ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.createBook(request))
                .message("Tạo mới sách thành công!")
                .build();
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> updateBook(
            @PathVariable String id,
            @ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateBook(id, request))
                .message("Cập nhật sách thành công!")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BookResponse> getBook(@PathVariable String id) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookById(id))
                .build();
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<BookResponse> getBookBySlug(@PathVariable String slug) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookBySlug(slug))
                .build();
    }

    @GetMapping
    public ApiResponse<List<BookResponse>> getAllBooks() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getAllBooks())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ApiResponse.<Void>builder()
                .message("Đã chuyển sách vào thùng rác!")
                .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<BookResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateStatus(id, status))
                .message("Cập nhật trạng thái thành công!")
                .build();
    }

    // ĐÃ XÓA PHÂN TRANG (page, size)
    @GetMapping("/trash")
    public ApiResponse<List<BookResponse>> getBooksInTrash() {
        return ApiResponse.<List<BookResponse>>builder()
                .data(bookService.getBooksInTrash())
                .build();
    }

    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restoreBook(@PathVariable String id) {
        bookService.restoreBook(id);
        return ApiResponse.<Void>builder()
                .message("Khôi phục sách thành công")
                .build();
    }

    @DeleteMapping("/hard-delete/{id}")
    public ApiResponse<Void> hardDeleteBook(@PathVariable String id) {
        bookService.hardDeleteBook(id);
        return ApiResponse.<Void>builder()
                .message("Đã xóa vĩnh viễn sách")
                .build();
    }
}