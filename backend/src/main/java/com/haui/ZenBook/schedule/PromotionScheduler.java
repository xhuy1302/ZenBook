package com.haui.ZenBook.schedule;

import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.PromotionStatus;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PromotionScheduler {

    private final PromotionRepository promotionRepository;
    private final BookRepository bookRepository;

    // Cron expression "0 * * * * *" nghĩa là: Cứ mỗi phút ở giây số 00 (VD: 10:01:00, 10:02:00) thì chạy hàm này
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void scanAndProcessPromotions() {
        LocalDateTime now = LocalDateTime.now();

        // =========================================================
        // 1. KÍCH HOẠT CÁC ĐỢT SALE ĐẾN GIỜ (SCHEDULED -> ACTIVE)
        // =========================================================
        List<PromotionEntity> promosToActivate = promotionRepository.findByStatusAndStartDateBefore(PromotionStatus.SCHEDULED, now);

        for (PromotionEntity promo : promosToActivate) {
            log.info("🚀 TỰ ĐỘNG BẬT Flash Sale: {} (Bắt đầu: {})", promo.getName(), promo.getStartDate());
            promo.setStatus(PromotionStatus.ACTIVE); // Đổi trạng thái thành Đang chạy

            // Duyệt qua từng cuốn sách trong đợt Sale để giảm giá
            for (BookEntity book : promo.getBooks()) {
                double newPrice = calculateDiscount(book.getOriginalPrice(), promo.getDiscountType(), promo.getDiscountValue());
                book.setSalePrice(newPrice); // Ghi đè giá Sale mới
            }
        }

        if (!promosToActivate.isEmpty()) {
            promotionRepository.saveAll(promosToActivate);
            // Lưu lại giá mới cho toàn bộ sách
            bookRepository.saveAll(promosToActivate.stream().flatMap(p -> p.getBooks().stream()).toList());
        }

        // =========================================================
        // 2. KẾT THÚC CÁC ĐỢT SALE HẾT GIỜ (ACTIVE -> EXPIRED)
        // =========================================================
        List<PromotionEntity> promosToExpire = promotionRepository.findByStatusAndEndDateBefore(PromotionStatus.ACTIVE, now);

        for (PromotionEntity promo : promosToExpire) {
            log.info("🛑 TỰ ĐỘNG TẮT Flash Sale: {} (Kết thúc: {})", promo.getName(), promo.getEndDate());
            promo.setStatus(PromotionStatus.EXPIRED); // Đổi trạng thái thành Đã kết thúc

            // Duyệt qua từng cuốn sách để trả lại giá gốc
            for (BookEntity book : promo.getBooks()) {
                book.setSalePrice(book.getOriginalPrice()); // Reset về giá gốc
            }
        }

        if (!promosToExpire.isEmpty()) {
            promotionRepository.saveAll(promosToExpire);
            // Lưu lại giá đã reset cho toàn bộ sách
            bookRepository.saveAll(promosToExpire.stream().flatMap(p -> p.getBooks().stream()).toList());
        }
    }


    private double calculateDiscount(Double originalPrice, DiscountType type, Double value) {
        if (originalPrice == null || originalPrice <= 0) return 0.0;

        if (type == DiscountType.PERCENTAGE) {
            // Giảm theo phần trăm (VD: giảm 20%)
            return originalPrice - (originalPrice * value / 100.0);
        } else if (type == DiscountType.FIXED_AMOUNT) {
            // Giảm tiền mặt (VD: giảm 50k). Dùng Math.max để tránh giá bị âm
            return Math.max(0, originalPrice - value);
        }
        return originalPrice;
    }
}