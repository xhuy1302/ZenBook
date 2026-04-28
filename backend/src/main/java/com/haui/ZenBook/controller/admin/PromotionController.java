package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("adminPromotionController") // Khai báo tên Bean để không trùng với Customer
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    // ==========================================
    // 📚 QUẢN LÝ CHUNG
    // ==========================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotions() {
        List<PromotionResponse> data = promotionService.getAllPromotions();
        return ResponseEntity.ok(ApiResponse.<List<PromotionResponse>>builder()
                .data(data)
                .message("Lấy danh sách khuyến mãi thành công")
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable String id) {
        PromotionResponse data = promotionService.getPromotionById(id);
        return ResponseEntity.ok(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Lấy chi tiết khuyến mãi thành công")
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        PromotionResponse data = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Tạo chương trình khuyến mãi thành công")
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(@PathVariable String id, @Valid @RequestBody PromotionRequest request) {
        PromotionResponse data = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Cập nhật khuyến mãi thành công")
                .build());
    }

    // ==========================================
    // 🛑 DỪNG & BẬT LẠI KHUYẾN MÃI
    // ==========================================

    @PatchMapping("/{id}/stop")
    public ResponseEntity<ApiResponse<PromotionResponse>> stopPromotion(@PathVariable String id) {
        PromotionResponse data = promotionService.stopPromotion(id);
        return ResponseEntity.ok(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Đã tạm dừng khuyến mãi")
                .build());
    }

    @PatchMapping("/{id}/resume")
    public ResponseEntity<ApiResponse<PromotionResponse>> resumePromotion(@PathVariable String id) {
        PromotionResponse data = promotionService.resumePromotion(id);
        return ResponseEntity.ok(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Đã tiếp tục khuyến mãi")
                .build());
    }

    // ==========================================
    // 🗑️ THÙNG RÁC & XÓA & KHÔI PHỤC
    // ==========================================

    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAllPromotionsInTrash() {
        List<PromotionResponse> data = promotionService.getAllPromotionsInTrash();
        return ResponseEntity.ok(ApiResponse.<List<PromotionResponse>>builder()
                .data(data)
                .message("Lấy danh sách thùng rác thành công")
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeletePromotion(@PathVariable String id) {
        promotionService.softDeletePromotion(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Đã đưa khuyến mãi vào thùng rác")
                .build());
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<PromotionResponse>> restorePromotion(@PathVariable String id) {
        PromotionResponse data = promotionService.restorePromotion(id);
        return ResponseEntity.ok(ApiResponse.<PromotionResponse>builder()
                .data(data)
                .message("Khôi phục khuyến mãi thành công")
                .build());
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<ApiResponse<Void>> hardDeletePromotion(@PathVariable String id) {
        promotionService.hardDeletePromotion(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa vĩnh viễn thành công")
                .build());
    }
}