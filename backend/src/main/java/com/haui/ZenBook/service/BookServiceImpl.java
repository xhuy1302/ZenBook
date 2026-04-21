package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.book.BookRequest;
import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.BookStatus;
import com.haui.ZenBook.enums.PromotionStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.BookMapper;
import com.haui.ZenBook.repository.*;
import com.haui.ZenBook.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
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
    private final PublisherRepository publisherRepository;
    private final BookImageRepository bookImageRepository;

    // ==============================================================================
    // 🔥 HÀM LÕI: TỰ TÍNH GIÁ DYNAMIC BẰNG JAVA THUẦN
    // ==============================================================================
    private BookResponse mapToResponseWithDiscount(BookEntity book) {
        if (book == null) return null;

        // 1. Nhờ MapStruct map các thông tin cơ bản
        BookResponse response = bookMapper.toResponse(book);

        // 2. Tự set lại giá gốc và giá bán mặc định
        response.setOriginalPrice(book.getOriginalPrice());
        response.setSalePrice(book.getSalePrice());

        // Tính % giảm giá mặc định (nếu có)
        if (book.getOriginalPrice() != null && book.getOriginalPrice() > book.getSalePrice()) {
            int discount = (int) Math.round(((book.getOriginalPrice() - book.getSalePrice()) / book.getOriginalPrice()) * 100);
            response.setDiscount(discount);
        }

        // 3. Tính Giá Flash Sale đè lên (nếu có)
        if (book.getPromotions() != null && !book.getPromotions().isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            double bestFlashSalePrice = book.getOriginalPrice() != null ? book.getOriginalPrice() : book.getSalePrice();
            boolean hasValidPromotion = false;

            for (PromotionEntity promo : book.getPromotions()) {
                if (promo.getStatus() == PromotionStatus.ACTIVE && !promo.isDeleted()
                        && promo.getStartDate().isBefore(now) && promo.getEndDate().isAfter(now)) {

                    hasValidPromotion = true;
                    double currentPromoPrice;

                    if ("PERCENTAGE".equals(promo.getDiscountType().name())) {
                        currentPromoPrice = book.getOriginalPrice() - (book.getOriginalPrice() * promo.getDiscountValue() / 100.0);
                    } else {
                        currentPromoPrice = Math.max(0, book.getOriginalPrice() - promo.getDiscountValue());
                    }

                    if (currentPromoPrice < bestFlashSalePrice) {
                        bestFlashSalePrice = currentPromoPrice;
                    }
                }
            }

            // Cập nhật vào Response nếu Flash Sale rẻ hơn
            if (hasValidPromotion && bestFlashSalePrice < book.getSalePrice()) {
                response.setSalePrice(bestFlashSalePrice);
                int newDiscount = (int) Math.round(((book.getOriginalPrice() - bestFlashSalePrice) / book.getOriginalPrice()) * 100);
                response.setDiscount(newDiscount);
            }
        }
        return response;
    }
    // ==============================================================================

    @Override
    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (request.getTitle() != null && !request.getTitle().isBlank()
                && bookRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.BOOK_TITLE_EXISTED, request.getTitle());
        }

        if (request.getIsbn() != null && !request.getIsbn().isBlank()
                && bookRepository.existsByIsbn(request.getIsbn())) {
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
                log.error(e.getMessage());
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
                            log.error(e.getMessage());
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
            return mapToResponseWithDiscount(bookRepository.save(book));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    @Transactional
    public BookResponse updateBook(String id, BookRequest request) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        if (request.getTitle() != null && !request.getTitle().isBlank()
                && !request.getTitle().equals(book.getTitle())
                && bookRepository.existsByTitleAndIdNot(request.getTitle(), id)) {
            throw new AppException(ErrorCode.BOOK_TITLE_EXISTED, request.getTitle());
        }

        if (request.getIsbn() != null && !request.getIsbn().isBlank()
                && !request.getIsbn().equals(book.getIsbn())
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new AppException(ErrorCode.BOOK_ISBN_EXISTED, request.getIsbn());
        }

        bookMapper.updateEntityFromRequest(request, book);
        book.setSlug(SlugUtils.makeSlug(request.getTitle()));

        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                if (book.getThumbnail() != null && !book.getThumbnail().isBlank()) {
                    s3Service.deleteFile(book.getThumbnail());
                }
                String newUrl = s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails");
                book.setThumbnail(newUrl);
            } catch (IOException e) {
                log.error(e.getMessage());
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        if (request.getDeleteImageIds() != null && !request.getDeleteImageIds().isEmpty()) {
            List<BookImageEntity> imagesToDelete = bookImageRepository.findAllById(request.getDeleteImageIds());
            for (BookImageEntity image : imagesToDelete) {
                if (!image.getBook().getId().equals(id)) {
                    continue;
                }
                if (image.getImageUrl() != null && !image.getImageUrl().isBlank()) {
                    s3Service.deleteFile(image.getImageUrl());
                }
                if (book.getImages() != null) {
                    book.getImages().removeIf(img -> img.getId().equals(image.getId()));
                }
                bookImageRepository.delete(image);
            }
        }

        if (request.getGalleryFiles() != null && !request.getGalleryFiles().isEmpty()) {
            if (book.getImages() == null) {
                book.setImages(new HashSet<>());
            }
            for (MultipartFile file : request.getGalleryFiles()) {
                if (file == null || file.isEmpty()) continue;
                try {
                    String url = s3Service.uploadFile(file, "books/gallery");
                    BookImageEntity newImage = BookImageEntity.builder()
                            .imageUrl(url)
                            .book(book)
                            .build();
                    book.getImages().add(newImage);
                } catch (IOException e) {
                    log.error(e.getMessage());
                    throw new AppException(ErrorCode.UPLOAD_FAILED);
                }
            }
        }

        mapRelationships(book, request);

        try {
            return mapToResponseWithDiscount(bookRepository.save(book));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new AppException(ErrorCode.BOOK_UPDATE_FAILED, id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookById(String id) {
        return bookRepository.findById(id)
                .map(this::mapToResponseWithDiscount)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        return bookRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponseWithDiscount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookBySlug(String slug) {
        return bookRepository.findBySlug(slug)
                .map(this::mapToResponseWithDiscount)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, slug));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getBooksInTrash() {
        return bookRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(this::mapToResponseWithDiscount)
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

        if (book.getThumbnail() != null && !book.getThumbnail().isBlank()) {
            s3Service.deleteFile(book.getThumbnail());
        }

        if (book.getImages() != null && !book.getImages().isEmpty()) {
            for (BookImageEntity image : book.getImages()) {
                if (image.getImageUrl() != null && !image.getImageUrl().isBlank()) {
                    s3Service.deleteFile(image.getImageUrl());
                }
            }
        }

        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public BookResponse updateStatus(String id, String status) {
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        try {
            book.setStatus(BookStatus.valueOf(status.toUpperCase()));
            return mapToResponseWithDiscount(bookRepository.save(book));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.KEY_INVALID);
        }
    }

    private void mapRelationships(BookEntity book, BookRequest request) {
        if (request.getPublisherId() != null && !request.getPublisherId().isBlank()) {
            PublisherEntity publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND, request.getPublisherId()));
            book.setPublisher(publisher);
        } else {
            book.setPublisher(null);
        }

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<CategoryEntity> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            if (categories.isEmpty()) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, "categories");
            book.setCategories(categories);
        } else {
            if (book.getCategories() != null) book.getCategories().clear();
        }

        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            Set<AuthorEntity> authors = new HashSet<>(authorRepository.findAllById(request.getAuthorIds()));
            if (authors.isEmpty()) throw new AppException(ErrorCode.AUTHOR_NOT_FOUND, "authors");
            book.setAuthors(authors);
        } else {
            if (book.getAuthors() != null) book.getAuthors().clear();
        }

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<TagEntity> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            book.setTags(tags);
        } else {
            if (book.getTags() != null) book.getTags().clear();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getRecentBooks() {
        Pageable limit = PageRequest.of(0, 12);
        return bookRepository.findTopRecentBooks(BookStatus.ACTIVE, limit)
                .stream()
                .map(this::mapToResponseWithDiscount)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getTrendingBooks() {
        Pageable limit = PageRequest.of(0, 6);
        return bookRepository.findTopTrendingBooks(BookStatus.ACTIVE, limit)
                .stream()
                .map(this::mapToResponseWithDiscount)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAwardBooks() {
        Pageable limit = PageRequest.of(0, 12);
        return bookRepository.findTopAwardBooks(BookStatus.ACTIVE, limit)
                .stream()
                .map(this::mapToResponseWithDiscount)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksWithFilterAndPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, BigDecimal minPrice, BigDecimal maxPrice, List<String> categoryIds) {

        // 1. Xử lý Sorting
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();

        // 2. Xử lý Pagination (Spring Boot dùng index từ 0, Frontend thường gửi từ 1)
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // 3. Tạo Specification từ các params
        Specification<BookEntity> spec = BookSpecification.filterBooks(keyword, minPrice, maxPrice, categoryIds);

        // 4. Query Database & Map sang DTO
        Page<BookEntity> bookPage = bookRepository.findAll(spec, pageable);

        return bookPage.map(this::mapToResponseWithDiscount);
    }

    @Override
    @Transactional
    public void incrementViewCount(String id) {
        // Tìm sách theo ID
        BookEntity book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));

        // Cộng 1 view (Xử lý trường hợp views đang bị null)
        int currentViews = book.getViews() == null ? 0 : book.getViews();
        book.setViews(currentViews + 1);

        bookRepository.save(book);
    }
}