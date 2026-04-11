package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.BookStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.BookMapper;
import com.haui.ZenBook.repository.*;
import com.haui.ZenBook.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final S3Service s3Service;

    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final TagRepository tagRepository;

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (request.getIsbn() != null && !request.getIsbn().isBlank() && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_ISBN_EXISTED, request.getIsbn());
        }

        BookEntity book = bookMapper.toEntity(request);

        String slug = SlugUtils.makeSlug(request.getTitle());
        if (bookRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        book.setSlug(slug);

        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                String thumbnailUrl = s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails");
                book.setThumbnail(thumbnailUrl);
            } catch (IOException e) {
                log.error("Lỗi upload thumbnail: {}", e.getMessage());
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        if (request.getGalleryFiles() != null && !request.getGalleryFiles().isEmpty()) {
            Set<BookImageEntity> images = request.getGalleryFiles().stream()
                    .map(file -> {
                        try {
                            String url = s3Service.uploadFile(file, "books/gallery");
                            return BookImageEntity.builder().imageUrl(url).book(book).build();
                        } catch (IOException e) {
                            log.error("Lỗi upload gallery image: {}", e.getMessage());
                            throw new AppException(ErrorCode.UPLOAD_FAILED);
                        }
                    }).collect(Collectors.toSet());
            book.setImages(images);
        }

        mapRelationships(book, request);

        if (book.getSpecification() != null) {
            book.getSpecification().setBook(book);
        }

        try {
            return bookMapper.toResponse(bookRepository.save(book));
        } catch (Exception e) {
            log.error("Lỗi lưu sách: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public BookResponse updateBook(String id, BookRequest request) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        if (request.getIsbn() != null && !request.getIsbn().isBlank() && !request.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.existsByIsbn(request.getIsbn())) {
                throw new AppException(ErrorCode.BOOK_ISBN_EXISTED, request.getIsbn());
            }
        }

        bookMapper.updateEntityFromRequest(request, book);
        book.setSlug(SlugUtils.makeSlug(request.getTitle()));

        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                String newUrl = s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails");
                book.setThumbnail(newUrl);
            } catch (IOException e) {
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        if (request.getGalleryFiles() != null && !request.getGalleryFiles().isEmpty()) {
            book.getImages().clear();
            for (MultipartFile file : request.getGalleryFiles()) {
                try {
                    String url = s3Service.uploadFile(file, "books/gallery");
                    book.getImages().add(BookImageEntity.builder().imageUrl(url).book(book).build());
                } catch (IOException e) {
                    throw new AppException(ErrorCode.UPLOAD_FAILED);
                }
            }
        }

        mapRelationships(book, request);

        try {
            return bookMapper.toResponse(bookRepository.save(book));
        } catch (Exception e) {
            log.error("Lỗi cập nhật sách: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.BOOK_UPDATE_FAILED, id);
        }
    }

    @Override
    @Transactional(readOnly = true) // QUAN TRỌNG: Load dữ liệu an toàn
    public BookResponse getBookById(String id) {
        return bookRepository.findById(id)
                .map(bookMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
    }

    @Override
    @Transactional(readOnly = true) // QUAN TRỌNG: Load dữ liệu an toàn
    public List<BookResponse> getAllBooks() {
        return bookRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(bookMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true) // QUAN TRỌNG: Load dữ liệu an toàn
    public BookResponse getBookBySlug(String slug) {
        return bookRepository.findBySlug(slug)
                .map(bookMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, slug));
    }

    @Override
    @Transactional(readOnly = true) // QUAN TRỌNG: Load dữ liệu an toàn & BỎ PHÂN TRANG
    public List<BookResponse> getBooksInTrash() {
        return bookRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(bookMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteBook(String id) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        book.setDeletedAt(LocalDateTime.now());
        book.setStatus(BookStatus.DELETED);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void restoreBook(String id) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        book.setDeletedAt(null);
        book.setStatus(BookStatus.INACTIVE);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void hardDeleteBook(String id) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public BookResponse updateStatus(String id, String status) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        try {
            book.setStatus(BookStatus.valueOf(status.toUpperCase()));
            return bookMapper.toResponse(bookRepository.save(book));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.KEY_INVALID);
        }
    }

    private void mapRelationships(BookEntity book, BookRequest request) {
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<CategoryEntity> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            if (categories.isEmpty()) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, "những ID danh mục cung cấp");
            book.setCategories(categories);
        } else {
            if(book.getCategories() != null) book.getCategories().clear();
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<AuthorEntity> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            if (authors.isEmpty()) throw new AppException(ErrorCode.AUTHOR_NOT_FOUND, "những ID tác giả cung cấp");
            book.setAuthors(authors);
        } else {
            if(book.getAuthors() != null) book.getAuthors().clear();
        }

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<TagEntity> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            book.setTags(tags);
        } else {
            if(book.getTags() != null) book.getTags().clear();
        }
    }
}