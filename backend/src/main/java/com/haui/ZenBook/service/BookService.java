package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;

import java.util.List;

public interface BookService {
    BookResponse createBook(BookRequest request);
    List<BookResponse> getAllBooks();
    BookResponse updateBook(String id, BookRequest request);
    BookResponse getBookById(String id);
    BookResponse getBookBySlug(String slug);
    void deleteBook(String id);
    BookResponse updateStatus(String id, String status);

    // ĐÃ SỬA: Bỏ Pageable, trả về List
    List<BookResponse> getBooksInTrash();
    void restoreBook(String id);
    void hardDeleteBook(String id);
}