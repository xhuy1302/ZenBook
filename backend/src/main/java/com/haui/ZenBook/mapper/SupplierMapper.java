package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.supplier.SupplierCreationRequest;
import com.haui.ZenBook.dto.supplier.SupplierResponse;
import com.haui.ZenBook.dto.supplier.SupplierUpdateRequest;
import com.haui.ZenBook.entity.SupplierEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    SupplierEntity toEntity(SupplierCreationRequest request);

    SupplierResponse toResponse(SupplierEntity entity);

    void updateSupplier(@MappingTarget SupplierEntity entity, SupplierUpdateRequest request);
}