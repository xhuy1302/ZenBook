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
import java.util.Map;
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
    private final PromotionService promotionService;

    private BookResponse mapToResponseWithDiscount(BookEntity book) {
        if (book == null) return null;
        BookResponse response = bookMapper.toResponse(book);

        double promoPrice = promotionService.getPromotionalPrice(book);

        if (promoPrice > 0) {
            response.setSalePrice(promoPrice);

            if (response.getOriginalPrice() != null && response.getOriginalPrice() > 0) {
                int discountPercent = (int) Math.round((1 - (promoPrice / response.getOriginalPrice())) * 100);
                response.setDiscount(discountPercent);
            }
        } else {
            if (response.getOriginalPrice() != null && response.getOriginalPrice() > 0) {
                int discountPercent = (int) Math.round((1 - (response.getSalePrice() / response.getOriginalPrice())) * 100);
                response.setDiscount(discountPercent);
            }
        }

        return response;
    }

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

        return mapToResponseWithDiscount(bookRepository.save(book));
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
                if (!image.getBook().getId().equals(id)) continue;
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
            if (book.getImages() == null) book.setImages(new HashSet<>());
            for (MultipartFile file : request.getGalleryFiles()) {
                if (file == null || file.isEmpty()) continue;
                try {
                    String url = s3Service.uploadFile(file, "books/gallery");
                    book.getImages().add(BookImageEntity.builder().imageUrl(url).book(book).build());
                } catch (IOException e) {
                    log.error(e.getMessage());
                    throw new AppException(ErrorCode.UPLOAD_FAILED);
                }
            }
        }

        mapRelationships(book, request);
        return mapToResponseWithDiscount(bookRepository.save(book));
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
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        book.setDeletedAt(LocalDateTime.now());
        book.setStatus(BookStatus.DELETED);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void restoreBook(String id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        book.setDeletedAt(null);
        book.setStatus(BookStatus.INACTIVE);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void hardDeleteBook(String id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        if (book.getThumbnail() != null) s3Service.deleteFile(book.getThumbnail());
        if (book.getImages() != null) {
            book.getImages().forEach(img -> { if (img.getImageUrl() != null) s3Service.deleteFile(img.getImageUrl()); });
        }
        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public BookResponse updateStatus(String id, String status) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        try {
            book.setStatus(BookStatus.valueOf(status.toUpperCase()));
            return mapToResponseWithDiscount(bookRepository.save(book));
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.KEY_INVALID);
        }
    }

    private void mapRelationships(BookEntity book, BookRequest request) {
        if (request.getPublisherId() != null && !request.getPublisherId().isBlank()) {
            book.setPublisher(publisherRepository.findById(request.getPublisherId()).orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND)));
        }
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            book.setCategories(new HashSet<>(categoryRepository.findAllById(request.getCategoryIds())));
        }
        if (request.getAuthorIds() != null && !request.getAuthorIds().isEmpty()) {
            book.setAuthors(new HashSet<>(authorRepository.findAllById(request.getAuthorIds())));
        }
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            book.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getRecentBooks() {
        return bookRepository.findTopRecentBooks(BookStatus.ACTIVE, PageRequest.of(0, 12))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getTrendingBooks() {
        return bookRepository.findTopTrendingBooks(BookStatus.ACTIVE, PageRequest.of(0, 6))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAwardBooks() {
        return bookRepository.findTopAwardBooks(BookStatus.ACTIVE, PageRequest.of(0, 12))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksWithFilterAndPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> categoryIds, List<String> authorIds, List<String> publisherIds,
            List<String> formats, List<String> languages, Integer minRating
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Specification<BookEntity> spec = BookSpecification.filterBooks(
                keyword, minPrice, maxPrice, categoryIds, authorIds, publisherIds, formats, languages, minRating
        );

        return bookRepository.findAll(spec, pageable).map(this::mapToResponseWithDiscount);
    }

    @Override
    @Transactional
    public void incrementViewCount(String id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        book.setViews((book.getViews() == null ? 0 : book.getViews()) + 1);
        bookRepository.save(book);
    }

    @Override
    public Map<String, Double> getPriceRange() {
        List<Object[]> range = bookRepository.getPriceRange();

        double minPrice = 0.0;
        double maxPrice = 500000.0; // Giá trị mặc định an toàn

        if (range != null && !range.isEmpty() && range.get(0)[0] != null) {
            minPrice = ((Number) range.get(0)[0]).doubleValue();
            maxPrice = ((Number) range.get(0)[1]).doubleValue();
        }

        // Nếu maxPrice bằng 0 (ví dụ shop toàn sách miễn phí), set cứng một mức max để slider UI không bị lỗi
        if (maxPrice <= minPrice) {
            maxPrice = minPrice + 100000.0;
        }

        return Map.of(
                "minPrice", minPrice,
                "maxPrice", maxPrice
        );
    }
}