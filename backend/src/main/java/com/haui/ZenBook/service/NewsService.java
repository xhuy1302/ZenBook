package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.news.NewsRequest;
import com.haui.ZenBook.dto.news.NewsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface NewsService {
    NewsResponse createNews(NewsRequest request, MultipartFile thumbnailFile, String authorId);

    List<NewsResponse> getAllNews();

    NewsResponse getNewsById(String id);

    NewsResponse updateNews(String id, NewsRequest request, MultipartFile thumbnailFile, boolean deleteThumbnail);

    void softDeleteNews(String id);

    void hardDeleteNews(String id);

    void restoreNews(String id);

    List<NewsResponse> getNewsInTrash();
}