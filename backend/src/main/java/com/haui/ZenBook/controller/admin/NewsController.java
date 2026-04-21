package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.news.NewsRequest;
import com.haui.ZenBook.dto.news.NewsResponse;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.service.NewsService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final MessageUtil messageUtil;
    private final NewsService newsService;

    // Helper: Lấy ID của Admin/User đang đăng nhập từ Spring Security
    private String getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserEntity) {
            return ((UserEntity) principal).getId();
        }
        return null; // Xử lý tùy logic dự án của bạn nếu chưa đăng nhập
    }

    // 1. Thêm mới Bài viết (Sử dụng ModelAttribute để nhận FormData chứa cả text và File)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NewsResponse> createNews(
            @ModelAttribute @Valid NewsRequest request,
            @RequestParam(value = "thumbnailFile", required = false) MultipartFile thumbnailFile) {

        String authorId = getCurrentUserId();

        return ApiResponse.<NewsResponse>builder()
                .data(newsService.createNews(request, thumbnailFile, authorId))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 2. Lấy danh sách toàn bộ Bài viết (Active)
    @GetMapping
    public ApiResponse<List<NewsResponse>> getAllNews() {
        return ApiResponse.<List<NewsResponse>>builder()
                .data(newsService.getAllNews())
                .build();
    }

    // 3. Lấy thông tin chi tiết 1 Bài viết
    @GetMapping("/{id}")
    public ApiResponse<NewsResponse> getNewsById(@PathVariable String id) {
        return ApiResponse.<NewsResponse>builder()
                .data(newsService.getNewsById(id))
                .build();
    }

    // 4. Cập nhật Bài viết (Bao gồm cập nhật nội dung và/hoặc thay ảnh mới)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NewsResponse> updateNews(
            @PathVariable String id,
            @ModelAttribute @Valid NewsRequest request,
            @RequestParam(value = "thumbnailFile", required = false) MultipartFile thumbnailFile,
            @RequestParam(value = "deleteThumbnail", defaultValue = "false") boolean deleteThumbnail) {

        return ApiResponse.<NewsResponse>builder()
                .data(newsService.updateNews(id, request, thumbnailFile, deleteThumbnail))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 5. Xóa mềm Bài viết (Chuyển vào thùng rác)
    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDeleteNews(@PathVariable String id) {
        newsService.softDeleteNews(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    // 6. Xóa vĩnh viễn Bài viết
    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDeleteNews(@PathVariable String id) {
        newsService.hardDeleteNews(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 7. Lấy danh sách Bài viết trong thùng rác
    @GetMapping("/trash")
    public ApiResponse<List<NewsResponse>> getNewsInTrash() {
        return ApiResponse.<List<NewsResponse>>builder()
                .data(newsService.getNewsInTrash())
                .build();
    }

    // 8. Khôi phục Bài viết từ thùng rác
    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restoreNews(@PathVariable String id) {
        newsService.restoreNews(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
}