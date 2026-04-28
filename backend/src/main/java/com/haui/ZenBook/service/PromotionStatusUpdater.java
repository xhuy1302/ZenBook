package com.haui.ZenBook.service;

import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import com.haui.ZenBook.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PromotionStatusUpdater {

    private final PromotionRepository promotionRepository;

    // Chạy tự động mỗi phút một lần (60000 ms)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void updatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Quét các chương trình SCHEDULED xem đã đến giờ chạy chưa
        List<PromotionEntity> scheduledPromos = promotionRepository.findByStatusAndDeletedFalse(PromotionStatus.SCHEDULED);
        for (PromotionEntity promo : scheduledPromos) {
            // Nếu hiện tại >= thời gian bắt đầu VÀ chưa qua thời gian kết thúc
            if (!now.isBefore(promo.getStartDate()) && now.isBefore(promo.getEndDate())) {
                promo.setStatus(PromotionStatus.ACTIVE);
                promotionRepository.save(promo);
                System.out.println("Chuyển trạng thái sang ACTIVE: " + promo.getName());
            }
            // Nếu tạo nhầm giờ quá khứ thì cho EXPIRED luôn
            else if (now.isAfter(promo.getEndDate())) {
                promo.setStatus(PromotionStatus.EXPIRED);
                promotionRepository.save(promo);
            }
        }

        // 2. Quét các chương trình ACTIVE xem đã hết hạn chưa
        List<PromotionEntity> activePromos = promotionRepository.findByStatusAndDeletedFalse(PromotionStatus.ACTIVE);
        for (PromotionEntity promo : activePromos) {
            // Nếu hiện tại >= thời gian kết thúc
            if (!now.isBefore(promo.getEndDate())) {
                promo.setStatus(PromotionStatus.EXPIRED);
                promotionRepository.save(promo);
                System.out.println("Chuyển trạng thái sang EXPIRED: " + promo.getName());
            }
        }
    }
}