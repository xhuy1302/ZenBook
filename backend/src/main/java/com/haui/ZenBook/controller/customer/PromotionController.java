package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.category.CategoryFilterResponse;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController("customerPromotionController") // Tên bean để tránh trùng với Admin
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final MessageSource messageSource;

    // 1. Lấy Flash Sale đang diễn ra hiện tại
    @GetMapping("/flash-sale/active")
    public ApiResponse<PromotionResponse> getActiveFlashSale() {
        PromotionResponse data = promotionService.getActiveFlashSale();
        return ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message(messageSource.getMessage("promotion.get_active.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    // 2. Lấy tất cả các khung giờ trong ngày
    @GetMapping("/flash-sale/today")
    public ApiResponse<List<PromotionResponse>> getTodayFlashSales() {
        List<PromotionResponse> data = promotionService.getFlashSalesByDate(LocalDateTime.now());
        return ApiResponse.<List<PromotionResponse>>builder()
                .data(data)
                .message(messageSource.getMessage("promotion.get_today.success", null, LocaleContextHolder.getLocale()))
                .build();
    }

    // 3. Lấy danh sách danh mục trong một khung giờ (👉 Đã sửa thành CategoryFilterResponse)
    @GetMapping("/flash-sale/{id}/categories")
    public ApiResponse<List<CategoryFilterResponse>> getCategoriesInFlashSale(@PathVariable String id) {
        List<CategoryFilterResponse> data = promotionService.getCategoriesByPromotionId(id);
        return ApiResponse.<List<CategoryFilterResponse>>builder()
                .data(data)
                .message(messageSource.getMessage("promotion.get_categories.success", null, LocaleContextHolder.getLocale()))
                .build();
    }
}