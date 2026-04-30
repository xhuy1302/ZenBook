package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.notice.NotificationResponse;
import com.haui.ZenBook.entity.NotificationEntity;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.NotificationMapper;
import com.haui.ZenBook.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    // =========================================================================
    // 1. HÀM GỐC CỐT LÕI
    // =========================================================================
    @Override
    @Transactional
    public void createNotification(String userId, String type, String title, String content, String link) {
        NotificationEntity notification = NotificationEntity.builder()
                .userId(userId)
                .type(type.toUpperCase())
                .title(title)
                .content(content)
                .link(link)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    // =========================================================================
    // 2. CÁC HÀM TIỆN ÍCH CHUYÊN DỤNG (Tự động gắn Icon & Link)
    // =========================================================================

    @Override
    @Transactional
    public void notifyOrder(String userId, String orderCode, String title, String content) {
        String finalTitle = "📦 " + title;
        String link = "/customer/orders/" + orderCode;
        createNotification(userId, "ORDER", finalTitle, content, link);
    }

    @Override
    @Transactional
    public void notifyVoucher(String userId, String title, String content, String link) {
        String finalTitle = title.startsWith("🎟️") || title.startsWith("🎁") ? title : "🎟️ " + title;
        // Nếu không truyền link, mặc định bay về trang VIP
        String finalLink = (link != null && !link.isBlank()) ? link : "/zenbookvip";
        createNotification(userId, "PROMOTION", finalTitle, content, finalLink);
    }

    @Override
    @Transactional
    public void notifyMembership(String userId, String title, String content, String link) { // 👉 Đã thêm tham số link
        String finalTitle = title.startsWith("👑") || title.startsWith("🔥") || title.startsWith("🎉") ? title : "👑 " + title;
        String finalLink = (link != null && !link.isBlank()) ? link : "/zenbookvip";
        createNotification(userId, "MEMBERSHIP", finalTitle, content, finalLink);
    }

    // 👉 THÔNG BÁO MỚI: Dành cho Hệ thống Đánh giá (Review)
    @Override
    @Transactional
    public void notifyInteraction(String userId, String title, String content, String bookSlug) {
        String finalTitle = "💬 " + title;
        // Điều hướng thẳng vào chi tiết sản phẩm, nhảy xuống khu vực review
        String link = "/products/" + bookSlug + "#reviews";
        createNotification(userId, "INTERACTION", finalTitle, content, link);
    }

    // =========================================================================
    // 3. CÁC HÀM XỬ LÝ ĐỌC/CHƯA ĐỌC
    // =========================================================================

    @Override
    public List<NotificationResponse> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(String notificationId, String userId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_DATA, "Không tìm thấy thông báo"));

        if (!notification.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.INVALID_ACTION, "Không có quyền thao tác");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userId) {
        List<NotificationEntity> unreadList = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        unreadList.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadList);
    }
}