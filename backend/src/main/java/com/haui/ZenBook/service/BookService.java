package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookService {

    // Tạo mới sách
    BookResponse createBook(BookRequest request);

    // Cập nhật sách theo ID
    BookResponse updateBook(String id, BookRequest request);

    // Lấy chi tiết sách theo ID
    BookResponse getBookById(String id);

    // Lấy chi tiết sách theo Slug (Dùng cho trang chi tiết sản phẩm phía khách hàng)
    BookResponse getBookBySlug(String slug);

    // Xóa mềm sách (Cập nhật deleted_at)
    void deleteBook(String id);

    // Lấy danh sách sách có phân trang và tìm kiếm cơ bản
    Page<BookResponse> getAllBooks(Pageable pageable, String search);

    // Thay đổi trạng thái sách (Ẩn/Hiện/Hết hàng)
    BookResponse updateStatus(String id, String status);
}