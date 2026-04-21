package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.PromotionMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final BookRepository bookRepository;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        PromotionEntity entity = promotionMapper.toEntity(request);
        PromotionStatus initialStatus = determineStatus(request.getStartDate(), request.getEndDate());
        entity.setStatus(initialStatus);
        entity.setDeleted(false);

        List<BookEntity> books = bookRepository.findAllById(request.getBookIds());
        entity.setBooks(books);

        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(String id, PromotionRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setDiscountType(request.getDiscountType());
        existing.setDiscountValue(request.getDiscountValue());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());

        PromotionStatus newStatus = determineStatus(request.getStartDate(), request.getEndDate());
        existing.setStatus(newStatus);

        List<BookEntity> newBooks = bookRepository.findAllById(request.getBookIds());
        existing.setBooks(newBooks);

        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    @Override
    @Transactional
    public PromotionResponse stopPromotion(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        existing.setStatus(PromotionStatus.PAUSED);
        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    @Override
    @Transactional
    public PromotionResponse resumePromotion(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (existing.getStatus() != PromotionStatus.PAUSED) {
            throw new RuntimeException("Chỉ có thể bật lại chương trình đang tạm dừng!");
        }

        if (LocalDateTime.now().isAfter(existing.getEndDate())) {
            throw new RuntimeException("Không thể bật lại vì chương trình đã quá hạn! Vui lòng cập nhật gia hạn thêm thời gian.");
        }

        PromotionStatus newStatus = determineStatus(existing.getStartDate(), existing.getEndDate());
        existing.setStatus(newStatus);

        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    @Override
    @Transactional
    public void softDeletePromotion(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        existing.setDeleted(true);
        existing.setStatus(PromotionStatus.PAUSED);
        promotionRepository.save(existing);
    }

    @Override
    @Transactional
    public PromotionResponse restorePromotion(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        existing.setDeleted(false);

        PromotionStatus newStatus = determineStatus(existing.getStartDate(), existing.getEndDate());
        existing.setStatus(newStatus);

        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    @Override
    @Transactional
    public void hardDeletePromotion(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        promotionRepository.delete(existing);
    }

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .sorted((p1, p2) -> {
                    int priority1 = getStatusPriority(p1.getStatus());
                    int priority2 = getStatusPriority(p2.getStatus());

                    if (priority1 != priority2) {
                        return Integer.compare(priority1, priority2);
                    }
                    return 0;
                })
                .map(promotionMapper::toResponse)
                .toList();
    }

    @Override
    public List<PromotionResponse> getAllPromotionsInTrash() {
        return promotionRepository.findByDeletedTrue().stream()
                .map(promotionMapper::toResponse)
                .toList();
    }

    @Override
    public PromotionResponse getPromotionById(String id) {
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return promotionMapper.toResponse(existing);
    }

    private void validateDates(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new AppException(ErrorCode.PROMOTION_DATE_INVALID);
        }
    }

    private PromotionStatus determineStatus(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(start)) return PromotionStatus.SCHEDULED;
        if (now.isAfter(end)) return PromotionStatus.EXPIRED;
        return PromotionStatus.ACTIVE;
    }

    private int getStatusPriority(PromotionStatus status) {
        if (status == null) return 3;
        return switch (status) {
            case SCHEDULED -> 0;
            case ACTIVE -> 1;
            case PAUSED, EXPIRED -> 2;
            default -> 3;
        };
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getActiveFlashSale() {
        List<PromotionEntity> activePromotions = promotionRepository.findActiveFlashSales();
        if (activePromotions != null && !activePromotions.isEmpty()) {
            return promotionMapper.toResponse(activePromotions.get(0));
        }
        return null;
    }
}