package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.notice.NotificationResponse;
import java.util.List;

public interface NotificationService {
    void createNotification(String userId, String type, String title, String content, String link);

    void notifyOrder(String userId, String orderCode, String title, String content);

    void notifyVoucher(String userId, String title, String content, String link);

    // Đã thêm tham số link
    void notifyMembership(String userId, String title, String content, String link);

    // Hàm mới cho Review
    void notifyInteraction(String userId, String title, String content, String bookSlug);

    List<NotificationResponse> getMyNotifications(String userId);
    long countUnread(String userId);
    void markAsRead(String notificationId, String userId);
    void markAllAsRead(String userId);
}