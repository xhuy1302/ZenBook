package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.category.CategoryFilterResponse;
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
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
        List<BookEntity> books = bookRepository.findAllById(request.getBookIds());

        validateOverlappingPromotions(books, request.getStartDate(), request.getEndDate(), null);

        PromotionEntity entity = promotionMapper.toEntity(request);
        entity.setStatus(determineStatus(request.getStartDate(), request.getEndDate()));
        entity.setDeleted(false);

        Set<BookEntity> bookSet = new HashSet<>(books);
        entity.setBooks(bookSet);

        for (BookEntity book : books) {
            if (book.getPromotions() == null) book.setPromotions(new HashSet<>());
            book.getPromotions().add(entity);
        }

        return mapPromotionToResponse(promotionRepository.save(entity));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(String id, PromotionRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        PromotionEntity existing = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        List<BookEntity> newBooks = bookRepository.findAllById(request.getBookIds());

        validateOverlappingPromotions(newBooks, request.getStartDate(), request.getEndDate(), id);

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

        Set<BookEntity> newBookSet = new HashSet<>(newBooks);
        existing.setBooks(newBookSet);

        for (BookEntity book : newBooks) {
            if (book.getPromotions() == null) book.setPromotions(new HashSet<>());
            book.getPromotions().add(existing);
        }

        return mapPromotionToResponse(promotionRepository.save(existing));
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

    private void validateOverlappingPromotions(List<BookEntity> books, LocalDateTime start, LocalDateTime end, String currentPromoId) {
        for (BookEntity book : books) {
            if (book.getPromotions() != null) {
                for (PromotionEntity existingPromo : book.getPromotions()) {
                    if (currentPromoId != null && existingPromo.getId().equals(currentPromoId)) continue;
                    if (existingPromo.isDeleted() || existingPromo.getStatus() == PromotionStatus.EXPIRED) continue;

                    boolean isOverlapping = !start.isAfter(existingPromo.getEndDate())
                            && !end.isBefore(existingPromo.getStartDate());

                    if (isOverlapping) {
                        throw new AppException(ErrorCode.PROMOTION_OVERLAPPING);
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public PromotionResponse stopPromotion(String id) {
        PromotionEntity e = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        e.setStatus(PromotionStatus.PAUSED);
        return mapPromotionToResponse(promotionRepository.save(e));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(this::mapPromotionToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getPromotionById(String id) {
        return mapPromotionToResponse(promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND)));
    }

    @Override
    @Transactional
    public void softDeletePromotion(String id) {
        PromotionEntity e = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        e.setDeleted(true);
        e.setStatus(PromotionStatus.PAUSED);
        promotionRepository.save(e);
    }

    @Override
    @Transactional
    public void hardDeletePromotion(String id) {
        PromotionEntity e = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        if (e.getBooks() != null) e.getBooks().forEach(b -> b.getPromotions().remove(e));
        promotionRepository.delete(e);
    }

    @Override
    @Transactional
    public PromotionResponse restorePromotion(String id) {
        PromotionEntity e = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        e.setDeleted(false);
        e.setStatus(determineStatus(e.getStartDate(), e.getEndDate()));
        return mapPromotionToResponse(promotionRepository.save(e));
    }

    @Override
    @Transactional
    public PromotionResponse resumePromotion(String id) {
        PromotionEntity e = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        if (e.getStatus() != PromotionStatus.PAUSED) throw new AppException(ErrorCode.PROMOTION_STATUS_INVALID);
        e.setStatus(determineStatus(e.getStartDate(), e.getEndDate()));
        return mapPromotionToResponse(promotionRepository.save(e));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllPromotionsInTrash() {
        return promotionRepository.findByDeletedTrue().stream()
                .map(this::mapPromotionToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getActiveFlashSale() {
        List<PromotionEntity> list = promotionRepository.findActiveFlashSales();
        return (list != null && !list.isEmpty()) ? mapPromotionToResponse(list.get(0)) : null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getFlashSalesByDate(LocalDateTime date) {
        // Đã thêm EXPIRED vào danh sách lấy dữ liệu
        return promotionRepository.findByDeletedFalseAndStatusInOrderByStatusAscStartDateAsc(
                        List.of(PromotionStatus.ACTIVE, PromotionStatus.SCHEDULED, PromotionStatus.EXPIRED)
                ).stream()
                .map(this::mapPromotionToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryFilterResponse> getCategoriesByPromotionId(String promotionId) {
        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        return promotion.getBooks().stream()
                .flatMap(book -> book.getCategories().stream())
                .distinct()
                .map(cat -> new CategoryFilterResponse(cat.getId(), cat.getCategoryName(), 0L))
                .toList();
    }

    @Override
    public double getPromotionalPrice(BookEntity book) {
        if (book == null || book.getSalePrice() == null) return 0.0;
        Set<PromotionEntity> promotions = book.getPromotions();
        if (promotions == null || promotions.isEmpty()) return 0.0;

        double basePrice = book.getSalePrice();
        double minPrice = basePrice;
        boolean hasActivePromo = false;

        for (PromotionEntity promo : promotions) {
            if (promo.getStatus() == PromotionStatus.ACTIVE && !promo.isDeleted()) {
                hasActivePromo = true;
                double currentPrice = basePrice;
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
                if (currentPrice < minPrice) minPrice = currentPrice;
            }
        }
        return hasActivePromo ? Math.max(minPrice, 0.0) : 0.0;
    }

    private PromotionResponse mapPromotionToResponse(PromotionEntity entity) {
        if (entity == null) return null;
        PromotionResponse response = promotionMapper.toResponse(entity);
        if (entity.getBooks() != null && response.getBooks() != null) {
            Map<String, BookEntity> bookEntityMap = entity.getBooks().stream()
                    .collect(Collectors.toMap(BookEntity::getId, b -> b));
            for (PromotionResponse.PromotionBookDto dto : response.getBooks()) {
                BookEntity bookEntity = bookEntityMap.get(dto.getId());
                if (bookEntity != null && bookEntity.getCategories() != null) {
                    List<CategoryFilterResponse> catDtos = bookEntity.getCategories().stream()
                            .map(cat -> new CategoryFilterResponse(cat.getId(), cat.getCategoryName(), 0L))
                            .collect(Collectors.toList());
                    dto.setCategories(catDtos);
                }
            }
        }
        return response;
    }
}