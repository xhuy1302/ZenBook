package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.address.AddressResponse;
import com.haui.ZenBook.entity.AddressEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AddressMapper {

    AddressResponse toAddressResponse(AddressEntity entity);

    List<AddressResponse> toAddressResponseList(List<AddressEntity> entities);

    // 👉 Ép buộc MapStruct phải map và xử lý luôn nếu Database lỡ có giá trị NULL
    @AfterMapping
    default void mapIsDefault(AddressEntity entity, @MappingTarget AddressResponse response) {
        if (entity.getIsDefault() != null) {
            response.setIsDefault(entity.getIsDefault());
        } else {
            response.setIsDefault(false); // Nếu dưới DB là NULL thì mặc định cho nó là false
        }
    }
}