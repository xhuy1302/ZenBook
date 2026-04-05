package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
@Slf4j
public class BookController {

    private final BookService bookService;

    // 1. TẠO MỚI SÁCH (Sử dụng ModelAttribute để nhận Form-data kèm file)
    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> createBook(@ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.createBook(request))
                .message("Tạo mới sách thành công!")
                .build();
    }

    // 2. CẬP NHẬT SÁCH
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ApiResponse<BookResponse> updateBook(
            @PathVariable String id,
            @ModelAttribute @Valid BookRequest request) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateBook(id, request))
                .message("Cập nhật sách thành công!")
                .build();
    }

    // 3. LẤY CHI TIẾT SÁCH THEO ID
    @GetMapping("/{id}")
    public ApiResponse<BookResponse> getBook(@PathVariable String id) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookById(id))
                .build();
    }

    // 4. LẤY CHI TIẾT SÁCH THEO SLUG (Dùng cho khách hàng xem sản phẩm)
    @GetMapping("/slug/{slug}")
    public ApiResponse<BookResponse> getBookBySlug(@PathVariable String slug) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.getBookBySlug(slug))
                .build();
    }

    // 5. LẤY DANH SÁCH SÁCH (Có phân trang, sắp xếp)
    @GetMapping
    public ApiResponse<Page<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ApiResponse.<Page<BookResponse>>builder()
                .data(bookService.getAllBooks(pageable, search))
                .build();
    }

    // 6. XÓA MỀM SÁCH
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteBook(@PathVariable String id) {
        bookService.deleteBook(id);
        return ApiResponse.<Void>builder()
                .message("Đã chuyển sách vào thùng rác!")
                .build();
    }

    // 7. CẬP NHẬT NHANH TRẠNG THÁI
    @PatchMapping("/{id}/status")
    public ApiResponse<BookResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ApiResponse.<BookResponse>builder()
                .data(bookService.updateStatus(id, status))
                .message("Cập nhật trạng thái thành công!")
                .build();
    }
}