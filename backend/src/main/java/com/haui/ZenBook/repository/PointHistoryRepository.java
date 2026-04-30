package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.PointHistoryEntity;
import com.haui.ZenBook.enums.PointTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistoryEntity, String> {

    // Lấy lịch sử điểm của user
    List<PointHistoryEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    // Kiểm tra xem đã tồn tại bản ghi điểm danh chưa
    boolean existsByUserIdAndTypeAndReferenceId(String userId, PointTransactionType type, String referenceId);

    // Tìm bản ghi điểm danh cụ thể (để lấy streak)
    Optional<PointHistoryEntity> findByUserIdAndTypeAndReferenceId(String userId, PointTransactionType type, String referenceId);
}