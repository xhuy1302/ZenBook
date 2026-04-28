package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.category.CategoryFilterResponse;
import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.entity.BookEntity;

import java.time.LocalDateTime;
import java.util.List;

public interface PromotionService {
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(String id, PromotionRequest request);
    void softDeletePromotion(String id);
    void hardDeletePromotion(String id);
    PromotionResponse restorePromotion(String id);
    PromotionResponse resumePromotion(String id);
    List<PromotionResponse> getAllPromotionsInTrash();
    PromotionResponse stopPromotion(String id);
    List<PromotionResponse> getAllPromotions();
    PromotionResponse getPromotionById(String id);
    PromotionResponse getActiveFlashSale();
    double getPromotionalPrice(BookEntity book);
    List<PromotionResponse> getFlashSalesByDate(LocalDateTime date);

    // 👉 Đã đổi kiểu trả về từ List<CategoryEntity> sang List<CategoryFilterResponse>
    List<CategoryFilterResponse> getCategoriesByPromotionId(String promotionId);
}