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
import org.springframework.cache.annotation.CacheEvict; // 👉 Xóa cache
import org.springframework.cache.annotation.Cacheable;  // 👉 Lưu cache
import org.springframework.cache.annotation.Caching;    // 👉 Tổ hợp cache
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

    // 👉 Helper: Tính toán giá bán sau khi áp dụng khuyến mãi
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
    // 👉 Khi tạo sách mới, xóa sạch cache các danh sách ở trang chủ để cập nhật dữ liệu mới
    @CacheEvict(value = {"recentBooks", "trendingBooks", "awardBooks", "allBooks"}, allEntries = true)
    public BookResponse createBook(BookRequest request) {
        if (request.getTitle() != null && !request.getTitle().isBlank() && bookRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.BOOK_TITLE_EXISTED, request.getTitle());
        }

        BookEntity book = bookMapper.toEntity(request);
        String slug = SlugUtils.makeSlug(request.getTitle());
        if (bookRepository.existsBySlug(slug)) slug = slug + "-" + System.currentTimeMillis();
        book.setSlug(slug);

        // Xử lý upload ảnh S3
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                book.setThumbnail(s3Service.uploadFile(request.getThumbnailFile(), "books/thumbnails"));
            } catch (IOException e) { throw new AppException(ErrorCode.UPLOAD_FAILED); }
        }

        mapRelationships(book, request);
        return mapToResponseWithDiscount(bookRepository.save(book));
    }

    @Override
    @Transactional
    // 👉 Khi cập nhật sách, xóa cache của chính cuốn đó và các danh sách liên quan
    @Caching(evict = {
            @CacheEvict(value = "books", key = "#id"),
            @CacheEvict(value = "booksBySlug", allEntries = true),
            @CacheEvict(value = {"recentBooks", "trendingBooks", "awardBooks", "allBooks"}, allEntries = true)
    })
    public BookResponse updateBook(String id, BookRequest request) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        bookMapper.updateEntityFromRequest(request, book);
        book.setSlug(SlugUtils.makeSlug(request.getTitle()));
        mapRelationships(book, request);
        return mapToResponseWithDiscount(bookRepository.save(book));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "books", key = "#id") // 👉 Lưu cache theo ID sách
    public BookResponse getBookById(String id) {
        log.info("🚀 Cache MISS - Lấy sách từ DB cho ID: {}", id);
        return bookRepository.findById(id)
                .map(this::mapToResponseWithDiscount)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "booksBySlug", key = "#slug")
    public BookResponse getBookBySlug(String slug) {
        return bookRepository.findBySlug(slug)
                .map(this::mapToResponseWithDiscount)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, slug));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "recentBooks") // 👉 Cache danh sách sách mới nhất
    public List<BookResponse> getRecentBooks() {
        return bookRepository.findTopRecentBooks(BookStatus.ACTIVE, PageRequest.of(0, 12))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "trendingBooks") // 👉 Cache danh sách sách thịnh hành
    public List<BookResponse> getTrendingBooks() {
        return bookRepository.findTopTrendingBooks(BookStatus.ACTIVE, PageRequest.of(0, 24))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "awardBooks") // 👉 Cache danh sách sách giải thưởng
    public List<BookResponse> getAwardBooks() {
        return bookRepository.findTopAwardBooks(BookStatus.ACTIVE, PageRequest.of(0, 12))
                .stream().map(this::mapToResponseWithDiscount).toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = {"books", "booksBySlug", "recentBooks", "trendingBooks", "awardBooks", "allBooks"}, allEntries = true)
    public void deleteBook(String id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        book.setDeletedAt(LocalDateTime.now());
        book.setStatus(BookStatus.DELETED);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"books", "booksBySlug", "recentBooks", "trendingBooks", "awardBooks", "allBooks"}, allEntries = true)
    public void restoreBook(String id) {
        BookEntity book = bookRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, id));
        book.setDeletedAt(null);
        book.setStatus(BookStatus.INACTIVE);
        bookRepository.save(book);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookResponse> getBooksWithFilterAndPagination(
            int page, int size, String sortBy, String sortDir,
            String keyword, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> categoryIds, List<String> authorIds, List<String> publisherIds,
            List<String> formats, List<String> languages, Integer minRating
    ) {
        // Không cache phần này vì tham số quá đa dạng, cache sẽ không hiệu quả
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
    public Map<String, Double> getPriceRange() {
        List<Object[]> range = bookRepository.getPriceRange();
        double minPrice = 0.0, maxPrice = 500000.0;
        if (range != null && !range.isEmpty() && range.get(0)[0] != null) {
            minPrice = ((Number) range.get(0)[0]).doubleValue();
            maxPrice = ((Number) range.get(0)[1]).doubleValue();
        }
        if (maxPrice <= minPrice) maxPrice = minPrice + 100000.0;
        return Map.of("minPrice", minPrice, "maxPrice", maxPrice);
    }

    @Override public List<BookResponse> getAllBooks() { return bookRepository.findByDeletedAtIsNullOrderByCreatedAtDesc().stream().map(this::mapToResponseWithDiscount).toList(); }
    @Override public List<BookResponse> getBooksInTrash() { return bookRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc().stream().map(this::mapToResponseWithDiscount).toList(); }
    @Override public void hardDeleteBook(String id) { bookRepository.deleteById(id); }
    @Override public BookResponse updateStatus(String id, String status) { BookEntity b = bookRepository.findById(id).orElseThrow(); b.setStatus(BookStatus.valueOf(status.toUpperCase())); return mapToResponseWithDiscount(bookRepository.save(b)); }
}