package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.notice.NotificationResponse;
import com.haui.ZenBook.entity.NotificationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "read", source = "read")
    NotificationResponse toResponse(NotificationEntity entity);
}