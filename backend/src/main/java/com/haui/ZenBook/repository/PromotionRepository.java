package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, String> {

    @Query("SELECT DISTINCT p FROM PromotionEntity p " +
            "LEFT JOIN FETCH p.books b " +
            "LEFT JOIN FETCH b.authors " +
            "WHERE p.status = 'ACTIVE' " +
            "AND CURRENT_TIMESTAMP BETWEEN p.startDate AND p.endDate " +
            "ORDER BY p.endDate ASC")
    List<PromotionEntity> findActiveFlashSales();

    List<PromotionEntity> findAllByDeletedFalseOrderByCreatedAtDesc();

    List<PromotionEntity> findByDeletedTrue();

    List<PromotionEntity> findByStatusAndStartDateBefore(PromotionStatus status, LocalDateTime time);

    List<PromotionEntity> findByStatusAndEndDateBefore(PromotionStatus status, LocalDateTime time);

    @Query("SELECT p FROM PromotionEntity p WHERE p.status = 'ACTIVE' AND p.deleted = false")
    List<PromotionEntity> findActivePromotions();

    List<PromotionEntity> findByStatusAndDeletedFalse(PromotionStatus status);

    List<PromotionEntity> findByDeletedFalseAndStatusInOrderByStatusAscStartDateAsc(Collection<PromotionStatus> statuses);
}