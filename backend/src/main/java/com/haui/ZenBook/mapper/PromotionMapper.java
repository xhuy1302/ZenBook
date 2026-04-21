package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import com.haui.ZenBook.enums.PromotionStatus;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    // ==========================================
    // 1. MAPPING CHÍNH
    // ==========================================

    // Map từ Entity sang Response (Trả về cho Frontend)
    PromotionResponse toResponse(PromotionEntity entity);

    // Map từ Request sang Entity (Khi lưu vào DB)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "id", ignore = true)
    // 👉 Đã XÓA dòng @Mapping slug bị lỗi ở đây
    PromotionEntity toEntity(PromotionRequest request);

    // ==========================================
    // 2. MAPPING CÁC THÀNH PHẦN CON (Khắc phục lỗi thiếu dữ liệu)
    // ==========================================

    // Hàm phụ 1: Map từ BookEntity sang PromotionBookDto
    @Mapping(target = "slug", source = "slug") // 👉 ĐẶT VÀO ĐÚNG HÀM NÀY: Ép MapStruct lấy slug của cuốn sách
    PromotionResponse.PromotionBookDto toPromotionBookDto(BookEntity book);

    // 👉 Hàm phụ 2: DẠY CHO MAPSTRUCT CÁCH MAP TÁC GIẢ (Fix lỗi không hiện tên)
    PromotionResponse.AuthorDto toAuthorDto(AuthorEntity author);

    // ==========================================
    // 3. LOGIC TÍNH TOÁN GIÁ DYNAMIC REAL-TIME
    // ==========================================
    @AfterMapping
    default void applyDiscountToBooks(PromotionEntity entity, @MappingTarget PromotionResponse response) {
        if (entity == null || response == null || response.getBooks() == null) return;

        // Kiểm tra xem Promotion này có đang thực sự chạy (Active & Đúng giờ) không
        LocalDateTime now = LocalDateTime.now();
        boolean isRunning = entity.getStatus() == PromotionStatus.ACTIVE
                && !entity.isDeleted()
                && entity.getStartDate().isBefore(now)
                && entity.getEndDate().isAfter(now);

        // Duyệt qua từng cuốn sách trong Promotion này để cập nhật lại giá hiển thị
        // Dùng PromotionBookDto thay vì BookResponse
        for (PromotionResponse.PromotionBookDto book : response.getBooks()) {

            // Nếu sách chưa có discount mặc định, tự tính (so sánh original và sale)
            if (book.getOriginalPrice() != null && book.getOriginalPrice() > book.getSalePrice()) {
                int currentDiscount = (int) Math.round(((book.getOriginalPrice() - book.getSalePrice()) / book.getOriginalPrice()) * 100);
                book.setDiscount(currentDiscount);
            }

            // Nếu Promotion đang chạy, bắt đầu áp dụng luật "Giá tốt nhất" (Best Price)
            if (isRunning && book.getOriginalPrice() != null) {
                double flashSalePrice;

                // Tính giá theo loại giảm giá của Promotion (Phần trăm hoặc Trừ thẳng tiền)
                if ("PERCENTAGE".equals(entity.getDiscountType().name())) {
                    flashSalePrice = book.getOriginalPrice() - (book.getOriginalPrice() * entity.getDiscountValue() / 100.0);
                } else {
                    // Trừ thẳng tiền (FIXED_AMOUNT) như trường hợp giảm 50k
                    flashSalePrice = Math.max(0, book.getOriginalPrice() - entity.getDiscountValue());
                }

                // Nếu giá Flash Sale tính ra mà RẺ HƠN giá đang bán hiện tại -> Chốt lấy giá Flash Sale
                if (flashSalePrice < book.getSalePrice()) {
                    book.setSalePrice(flashSalePrice);

                    // Tính lại % giảm giá mới để hiện lên cái Badge màu đỏ trên giao diện
                    int newDiscount = (int) Math.round(((book.getOriginalPrice() - flashSalePrice) / book.getOriginalPrice()) * 100);
                    book.setDiscount(newDiscount);
                }
            }
        }
    }
}