package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.publisher.PublisherResponse;
import com.haui.ZenBook.dto.publisher.PublisherUpdateRequest;
import com.haui.ZenBook.dto.publisher.PublisherCreationRequest;
import com.haui.ZenBook.entity.PublisherEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PublisherMapper {
    PublisherEntity toEntity(PublisherCreationRequest request);
    PublisherResponse toResponse(PublisherEntity entity);
    void updatePublisher(@MappingTarget PublisherEntity entity, PublisherUpdateRequest request); // Đã sửa tên method
}