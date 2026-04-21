package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.address.AddressResponse;
import com.haui.ZenBook.entity.AddressEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AddressMapper {

    // Map 1 Entity sang DTO
    AddressResponse toAddressResponse(AddressEntity entity);

    // Map 1 List Entity sang List DTO
    List<AddressResponse> toAddressResponseList(List<AddressEntity> entities);
}