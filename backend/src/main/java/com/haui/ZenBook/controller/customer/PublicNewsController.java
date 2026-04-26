package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.news.NewsResponse;
import com.haui.ZenBook.dto.news.NewsStatsResponse;
import com.haui.ZenBook.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/news")
@RequiredArgsConstructor
public class PublicNewsController {

    private final NewsService newsService;

    @GetMapping
    public ApiResponse<Page<NewsResponse>> getPublicNews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryId,
            @RequestParam(defaultValue = "0") int page, // 👉 Sửa mặc định về 0
            @RequestParam(name = "size", defaultValue = "9") int size // 👉 Đổi thành size để khớp Frontend
    ) {

        return ApiResponse.<Page<NewsResponse>>builder()
                // 👉 Truyền thẳng page vào, KHÔNG CÒN page - 1 nữa!
                .data(newsService.getPublicNews(search, categoryId, page, size))
                .build();
    }

    @GetMapping("/stats")
    public ApiResponse<NewsStatsResponse> getNewsStats() {
        return ApiResponse.<NewsStatsResponse>builder()
                .data(newsService.getNewsStats())
                .build();
    }

    @GetMapping("/featured")
    public ApiResponse<List<NewsResponse>> getFeaturedNews() {
        return ApiResponse.<List<NewsResponse>>builder()
                .data(newsService.getFeaturedNews())
                .build();
    }

    // lấy theo slug
    @GetMapping("/slug/{slug}")
    public ApiResponse<NewsResponse> getNewsBySlug(@PathVariable String slug) {
        return ApiResponse.<NewsResponse>builder()
                .data(newsService.getNewsBySlug(slug))
                .build();
    }

    // lấy theo id (nếu admin cần)
    @GetMapping("/id/{id}")
    public ApiResponse<NewsResponse> getNewsById(@PathVariable String id) {
        return ApiResponse.<NewsResponse>builder()
                .data(newsService.getNewsById(id))
                .build();
    }

    @PatchMapping("/id/{id}/view")
    public ApiResponse<Void> incrementViewCount(@PathVariable String id) {
        newsService.incrementViewCount(id);
        return ApiResponse.<Void>builder().build();
    }
}