package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.notice.NotificationResponse;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private String getUserIdFromToken(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return user.getId();
    }

    // 1. Lấy danh sách thông báo
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        String userId = getUserIdFromToken(authentication);
        return ApiResponse.<List<NotificationResponse>>builder()
                .data(notificationService.getMyNotifications(userId))
                .build();
    }

    // 2. Lấy số lượng thông báo chưa đọc (Dùng để hiện lên chuông)
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(Authentication authentication) {
        String userId = getUserIdFromToken(authentication);
        return ApiResponse.<Long>builder()
                .data(notificationService.countUnread(userId))
                .build();
    }

    // 3. Đánh dấu 1 thông báo đã đọc
    @PutMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable String id, Authentication authentication) {
        String userId = getUserIdFromToken(authentication);
        notificationService.markAsRead(id, userId);
        return ApiResponse.<String>builder().message("Đã đánh dấu đọc").build();
    }

    // 4. Đánh dấu tất cả đã đọc
    @PutMapping("/read-all")
    public ApiResponse<String> markAllAsRead(Authentication authentication) {
        String userId = getUserIdFromToken(authentication);
        notificationService.markAllAsRead(userId);
        return ApiResponse.<String>builder().message("Đã đánh dấu tất cả").build();
    }
}