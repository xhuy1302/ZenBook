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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
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
    private final SupplierRepository supplierRepository;
    private final TagRepository tagRepository;

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        // 1. Kiểm tra ISBN nếu có (Tránh trùng mã sách)
        if (request.getIsbn() != null && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_ISBN_EXISTED);
        }

        // 2. Map cơ bản từ Request sang Entity
        BookEntity book = bookMapper.toEntity(request);

        // 3. Xử lý Slug tự động
        String slug = SlugUtils.makeSlug(request.getTitle());
        if (bookRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        book.setSlug(slug);

        // 4. Upload Thumbnail lên S3
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                String thumbnailUrl = s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails");
                book.setThumbnail(thumbnailUrl);
            } catch (IOException e) {
                log.error("Lỗi upload thumbnail: {}", e.getMessage());
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        // 5. Upload Gallery lên S3
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

        // 6. Gán các quan hệ (Supplier, Categories, Authors, Tags)
        mapRelationships(book, request);

        // 7. Gán quan hệ 2 chiều cho Specs (để cascade lưu tự động)
        if (book.getSpecification() != null) {
            book.getSpecification().setBook(book);
        }

        try {
            return bookMapper.toResponse(bookRepository.save(book));
        } catch (Exception e) {
            log.error("Lỗi lưu sách: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public BookResponse updateBook(String id, BookRequest request) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Kiểm tra ISBN mới có trùng với sách khác không
        if (request.getIsbn() != null && !request.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.existsByIsbn(request.getIsbn())) {
                throw new AppException(ErrorCode.BOOK_ISBN_EXISTED);
            }
        }

        // Cập nhật thông tin cơ bản
        bookMapper.updateEntityFromRequest(request, book);
        book.setSlug(SlugUtils.makeSlug(request.getTitle()));

        // Cập nhật Thumbnail nếu có file mới gửi lên
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                String newUrl = s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails");
                book.setThumbnail(newUrl);
            } catch (IOException e) {
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        // Cập nhật Gallery nếu có files mới gửi lên
        if (request.getGalleryFiles() != null && !request.getGalleryFiles().isEmpty()) {
            book.getImages().clear(); // Xóa sạch ảnh cũ để thay bằng list mới
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
            throw new AppException(ErrorCode.BOOK_UPDATE_FAILED);
        }
    }

    @Override
    public BookResponse getBookById(String id) {
        return bookRepository.findById(id)
                .map(bookMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    @Override
    public BookResponse getBookBySlug(String slug) {
        return bookRepository.findBySlug(slug)
                .map(bookMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    @Override
    @Transactional
    public void deleteBook(String id) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Bạn có thể thêm check nếu sách đang có trong đơn hàng thì không cho xóa
        // throw new AppException(ErrorCode.BOOK_DELETE_FAILED);

        book.setDeletedAt(LocalDateTime.now());
        book.setStatus(BookStatus.DELETED);
        bookRepository.save(book);
    }

    @Override
    public Page<BookResponse> getAllBooks(Pageable pageable, String search) {
        // Tạm thời lấy tất cả, bạn có thể custom thêm filter search ở đây
        return bookRepository.findAll(pageable).map(bookMapper::toResponse);
    }

    @Override
    @Transactional
    public BookResponse updateStatus(String id, String status) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        try {
            book.setStatus(BookStatus.valueOf(status.toUpperCase()));
            return bookMapper.toResponse(bookRepository.save(book));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.KEY_INVALID);
        }
    }

    private void mapRelationships(BookEntity book, BookRequest request) {
        // Map Supplier
        if (request.getSupplierId() != null) {
            book.setSupplier(supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND)));
        }

        // Map Categories
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<CategoryEntity> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            if (categories.isEmpty()) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
            book.setCategories(categories);
        }

        // Map Authors
        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<AuthorEntity> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            if (authors.isEmpty()) throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
            book.setAuthors(authors);
        }

        // Map Tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<TagEntity> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            // Tag không bắt buộc nên không throw lỗi nếu trống, tùy bạn quyết định
            book.setTags(tags);
        }
    }
}