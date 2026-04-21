package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("customerPromotionController")
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final MessageSource messageSource;

    @GetMapping("/flash-sale/active")
    public ApiResponse<PromotionResponse> getActiveFlashSale() {
        PromotionResponse data = promotionService.getActiveFlashSale();
        return ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message(messageSource.getMessage("promotion.get_active.success", null, LocaleContextHolder.getLocale()))
                .build();
    }
}