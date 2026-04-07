package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.receipt.ReceiptDetailResponse;
import com.haui.ZenBook.dto.receipt.ReceiptResponse;
import com.haui.ZenBook.entity.ReceiptDetailEntity;
import com.haui.ZenBook.entity.ReceiptEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiptMapper {

    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.name") // Giả sử SupplierEntity có thuộc tính name
    ReceiptResponse toResponse(ReceiptEntity entity);

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title") // Giả sử BookEntity có thuộc tính title
    ReceiptDetailResponse toDetailResponse(ReceiptDetailEntity entity);
}