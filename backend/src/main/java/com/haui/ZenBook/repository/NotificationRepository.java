package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, String> {

    // Lấy thông báo mới nhất của user
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    // Đếm số lượng thông báo chưa đọc
    long countByUserIdAndIsReadFalse(String userId);
}