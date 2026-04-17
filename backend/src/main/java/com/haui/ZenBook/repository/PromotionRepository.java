package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, String> {

    List<PromotionEntity> findAllByDeletedFalseOrderByCreatedAtDesc();

    List<PromotionEntity> findByDeletedTrue();

    List<PromotionEntity> findByStatusAndStartDateBefore(PromotionStatus status, LocalDateTime time);

    List<PromotionEntity> findByStatusAndEndDateBefore(PromotionStatus status, LocalDateTime time);
}