package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    // ==========================================
    // 📚 QUẢN LÝ CHUNG
    // ==========================================

    @GetMapping
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotionById(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(@PathVariable String id, @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }

    // ==========================================
    // 🛑 DỪNG & BẬT LẠI KHUYẾN MÃI
    // ==========================================

    @PatchMapping("/{id}/stop")
    public ResponseEntity<PromotionResponse> stopPromotion(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.stopPromotion(id));
    }

    @PatchMapping("/{id}/resume")
    public ResponseEntity<PromotionResponse> resumePromotion(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.resumePromotion(id));
    }

    // ==========================================
    // 🗑️ THÙNG RÁC & XÓA & KHÔI PHỤC
    // ==========================================

    // 1. Lấy danh sách khuyến mãi đã bị xóa mềm (nằm trong thùng rác)
    @GetMapping("/trash")
    public ResponseEntity<List<PromotionResponse>> getAllPromotionsInTrash() {
        return ResponseEntity.ok(promotionService.getAllPromotionsInTrash());
    }

    // 2. Xóa mềm (Đưa vào thùng rác) - Thay thế cho hàm delete cũ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeletePromotion(@PathVariable String id) {
        promotionService.softDeletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    // 3. Khôi phục khuyến mãi từ thùng rác
    @PatchMapping("/{id}/restore")
    public ResponseEntity<PromotionResponse> restorePromotion(@PathVariable String id) {
        return ResponseEntity.ok(promotionService.restorePromotion(id));
    }

    // 4. Xóa cứng (Xóa vĩnh viễn khỏi Database)
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeletePromotion(@PathVariable String id) {
        promotionService.hardDeletePromotion(id);
        return ResponseEntity.noContent().build();
    }
}