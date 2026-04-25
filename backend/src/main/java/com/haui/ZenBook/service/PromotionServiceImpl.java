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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        entity.setStatus(determineStatus(request.getStartDate(), request.getEndDate()));
        entity.setDeleted(false);

        List<BookEntity> books = bookRepository.findAllById(request.getBookIds());
        Set<BookEntity> bookSet = new HashSet<>(books);
        entity.setBooks(bookSet);

        for (BookEntity book : books) {
            if (book.getPromotions() == null) book.setPromotions(new HashSet<>());
            book.getPromotions().add(entity);
        }

        return promotionMapper.toResponse(promotionRepository.save(entity));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(String id, PromotionRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        PromotionEntity existing = promotionRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (existing.getBooks() != null) {
            existing.getBooks().forEach(b -> b.getPromotions().remove(existing));
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setDiscountType(request.getDiscountType());
        existing.setDiscountValue(request.getDiscountValue());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setStatus(determineStatus(request.getStartDate(), request.getEndDate()));

        List<BookEntity> newBooks = bookRepository.findAllById(request.getBookIds());
        Set<BookEntity> newBookSet = new HashSet<>(newBooks);
        existing.setBooks(newBookSet);

        for (BookEntity book : newBooks) {
            if (book.getPromotions() == null) book.setPromotions(new HashSet<>());
            book.getPromotions().add(existing);
        }

        return promotionMapper.toResponse(promotionRepository.save(existing));
    }

    private void validateDates(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) throw new AppException(ErrorCode.PROMOTION_DATE_INVALID);
    }

    private PromotionStatus determineStatus(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(start)) return PromotionStatus.SCHEDULED;
        if (now.isAfter(end)) return PromotionStatus.EXPIRED;
        return PromotionStatus.ACTIVE;
    }

    @Override public PromotionResponse stopPromotion(String id) { PromotionEntity e = promotionRepository.findById(id).orElseThrow(); e.setStatus(PromotionStatus.PAUSED); return promotionMapper.toResponse(promotionRepository.save(e)); }
    @Override public List<PromotionResponse> getAllPromotions() { return promotionRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream().map(promotionMapper::toResponse).toList(); }
    @Override public PromotionResponse getPromotionById(String id) { return promotionMapper.toResponse(promotionRepository.findById(id).orElseThrow()); }
    @Override public void softDeletePromotion(String id) { PromotionEntity e = promotionRepository.findById(id).orElseThrow(); e.setDeleted(true); e.setStatus(PromotionStatus.PAUSED); promotionRepository.save(e); }
    @Override public void hardDeletePromotion(String id) { PromotionEntity e = promotionRepository.findById(id).orElseThrow(); if (e.getBooks() != null) e.getBooks().forEach(b -> b.getPromotions().remove(e)); promotionRepository.delete(e); }
    @Override public PromotionResponse restorePromotion(String id) { PromotionEntity e = promotionRepository.findById(id).orElseThrow(); e.setDeleted(false); e.setStatus(determineStatus(e.getStartDate(), e.getEndDate())); return promotionMapper.toResponse(promotionRepository.save(e)); }
    @Override public PromotionResponse resumePromotion(String id) { PromotionEntity e = promotionRepository.findById(id).orElseThrow(); if (e.getStatus() != PromotionStatus.PAUSED) throw new RuntimeException("Error"); e.setStatus(determineStatus(e.getStartDate(), e.getEndDate())); return promotionMapper.toResponse(promotionRepository.save(e)); }
    @Override public List<PromotionResponse> getAllPromotionsInTrash() { return promotionRepository.findByDeletedTrue().stream().map(promotionMapper::toResponse).toList(); }
    @Override public PromotionResponse getActiveFlashSale() { List<PromotionEntity> list = promotionRepository.findActiveFlashSales(); return (list != null && !list.isEmpty()) ? promotionMapper.toResponse(list.get(0)) : null; }

    // 👉 ĐÃ FIX: Hàm tính giá trị khuyến mãi thực tế
    @Override
    public double getPromotionalPrice(BookEntity book) {
        if (book == null || book.getSalePrice() == null) return 0.0;

        Set<PromotionEntity> promotions = book.getPromotions();
        if (promotions == null || promotions.isEmpty()) return 0.0;

        double basePrice = book.getSalePrice();
        double minPrice = basePrice;
        boolean hasActivePromo = false;

        for (PromotionEntity promo : promotions) {
            // Chỉ tính những promotion đang ACTIVE và chưa bị xóa
            if (promo.getStatus() == PromotionStatus.ACTIVE && !promo.isDeleted()) {
                hasActivePromo = true;
                double currentPrice = basePrice;

                // Tính toán dựa trên loại hình giảm giá
                // ⚠️ Chú ý: Hãy sửa lại tên PERCENTAGE và FIXED_AMOUNT cho khớp với Enum DiscountType của bạn
                switch (promo.getDiscountType().name()) {
                    case "PERCENTAGE":
                    case "PERCENT":
                        currentPrice = basePrice - (basePrice * promo.getDiscountValue() / 100.0);
                        break;
                    case "FIXED_AMOUNT":
                    case "FIXED":
                    case "CASH":
                        currentPrice = basePrice - promo.getDiscountValue();
                        break;
                }

                // Luôn lấy giá thấp nhất (nếu sách tham gia nhiều CTKM)
                if (currentPrice < minPrice) {
                    minPrice = currentPrice;
                }
            }
        }

        // Nếu tính toán ra số âm thì trả về 0, nếu không có KM active thì trả về 0.0
        return hasActivePromo ? Math.max(minPrice, 0.0) : 0.0;
    }
}