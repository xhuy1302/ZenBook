package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.news.NewsRequest;
import com.haui.ZenBook.dto.news.NewsResponse;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.NewsStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.NewsMapper;
import com.haui.ZenBook.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j // Thêm @Slf4j để log lỗi giống BookServiceImpl
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final BookRepository bookRepository;
    private final NewsMapper newsMapper;
    private final S3Service s3Service;

    // ================= HELPER: TẠO SLUG TỪ TITLE =================
    private String generateSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        String noAccent = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        String slug = noAccent.replaceAll("[^a-zA-Z0-9\\s]", "").replaceAll("\\s+", "-").toLowerCase();
        return slug;
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request, MultipartFile thumbnailFile, String authorId) {
        if (newsRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.NEWS_TITLE_EXISTED, request.getTitle());
        }

        NewsEntity news = newsMapper.toEntity(request);

        String slug = generateSlug(request.getTitle());
        if (newsRepository.existsBySlug(slug)) {
            slug += "-" + System.currentTimeMillis();
        }
        news.setSlug(slug);

        UserEntity author = userRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, authorId));
        news.setAuthor(author);

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.NEWS_CATEGORY_NOT_FOUND, request.getCategoryId()));
            news.setCategory(category);
        }

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            news.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }
        if (request.getBookIds() != null && !request.getBookIds().isEmpty()) {
            news.setBooks(new HashSet<>(bookRepository.findAllById(request.getBookIds())));
        }

        // Upload Thumbnail
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            try {
                String thumbnailUrl = s3Service.uploadFile(thumbnailFile, "news/thumbnails");
                news.setThumbnail(thumbnailUrl);
            } catch (IOException e) {
                log.error("Lỗi upload thumbnail news: {}", e.getMessage());
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        if (news.getStatus() == null) news.setStatus(NewsStatus.DRAFT);
        news.setViewCount(0);
        if (news.getStatus() == NewsStatus.PUBLISHED) {
            news.setPublishedAt(LocalDateTime.now());
        }

        return newsMapper.toResponse(newsRepository.save(news));
    }

    @Override
    public List<NewsResponse> getAllNews() {
        return newsRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream().map(newsMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public NewsResponse getNewsById(String id) {
        NewsEntity news = newsRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND, id));
        return newsMapper.toResponse(news);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(String id, NewsRequest request, MultipartFile thumbnailFile, boolean deleteThumbnail) {
        NewsEntity news = newsRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND, id));

        if (!news.getTitle().equals(request.getTitle()) && newsRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.NEWS_TITLE_EXISTED, request.getTitle());
        }

        newsMapper.updateEntity(news, request);

        if (!news.getTitle().equals(request.getTitle())) {
            String slug = generateSlug(request.getTitle());
            if (newsRepository.existsBySlugAndIdNot(slug, id)) {
                slug += "-" + System.currentTimeMillis();
            }
            news.setSlug(slug);
        }

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.NEWS_CATEGORY_NOT_FOUND, request.getCategoryId()));
            news.setCategory(category);
        } else {
            news.setCategory(null);
        }

        if (request.getTagIds() != null) {
            news.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }
        if (request.getBookIds() != null) {
            news.setBooks(new HashSet<>(bookRepository.findAllById(request.getBookIds())));
        }

        // ================= XỬ LÝ ẢNH (Có xóa trên S3) =================

        // 1. Nếu Client yêu cầu xóa ảnh cũ (hoặc chuẩn bị up ảnh mới)
        if (deleteThumbnail || (thumbnailFile != null && !thumbnailFile.isEmpty())) {
            if (news.getThumbnail() != null && !news.getThumbnail().isBlank()) {
                s3Service.deleteFile(news.getThumbnail()); // Gọi S3Service xóa file
            }
            news.setThumbnail(null);
        }

        // 2. Upload ảnh mới (nếu có)
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            try {
                String thumbnailUrl = s3Service.uploadFile(thumbnailFile, "news/thumbnails");
                news.setThumbnail(thumbnailUrl);
            } catch (IOException e) {
                log.error("Lỗi upload thumbnail news: {}", e.getMessage());
                throw new AppException(ErrorCode.UPLOAD_FAILED);
            }
        }

        if (request.getStatus() == NewsStatus.PUBLISHED && news.getPublishedAt() == null) {
            news.setPublishedAt(LocalDateTime.now());
        }

        return newsMapper.toResponse(newsRepository.save(news));
    }

    @Override
    @Transactional
    public void softDeleteNews(String id) {
        NewsEntity news = newsRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND, id));
        news.setDeletedAt(LocalDateTime.now());
        news.setStatus(NewsStatus.HIDDEN);
        newsRepository.save(news);
    }

    @Override
    @Transactional
    public void hardDeleteNews(String id) {
        NewsEntity news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND, id));

        // ================= XÓA ẢNH TRÊN S3 TRƯỚC KHI XÓA DATA =================
        if (news.getThumbnail() != null && !news.getThumbnail().isBlank()) {
            s3Service.deleteFile(news.getThumbnail());
        }

        newsRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void restoreNews(String id) {
        NewsEntity news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND, id));

        if (news.getDeletedAt() == null) {
            throw new RuntimeException("Bài viết này không nằm trong thùng rác.");
        }

        if (newsRepository.existsBySlugAndIdNot(news.getSlug(), id)) {
            throw new AppException(ErrorCode.NEWS_RESTORE_FAILED_SLUG_EXISTED, news.getSlug());
        }

        news.setDeletedAt(null);
        news.setStatus(NewsStatus.DRAFT);
        newsRepository.save(news);
    }

    @Override
    public List<NewsResponse> getNewsInTrash() {
        return newsRepository.findAllByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream().map(newsMapper::toResponse).collect(Collectors.toList());
    }
}