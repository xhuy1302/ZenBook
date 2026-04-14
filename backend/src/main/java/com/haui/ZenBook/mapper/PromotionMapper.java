package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.promotion.PromotionRequest;
import com.haui.ZenBook.dto.promotion.PromotionResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PromotionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    // 1. Map từ Entity sang Response (Trả về cho Frontend)
    PromotionResponse toResponse(PromotionEntity entity);

    // Hàm phụ: Đổi từ BookEntity sang PromotionBookDto cho gọn nhẹ
    PromotionResponse.PromotionBookDto toPromotionBookDto(BookEntity book);

    // 2. Map từ Request sang Entity (Khi lưu vào DB)
    // 👉 Ta bỏ qua trường 'books' vì 'bookIds' từ Request chỉ là String,
    // ta sẽ dùng Service tìm BookEntity thật đắp vào sau.
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "id", ignore = true) // ID để DB tự sinh
    PromotionEntity toEntity(PromotionRequest request);
}