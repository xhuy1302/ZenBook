package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.chat.ChatMessageRequest;
import com.haui.ZenBook.dto.chat.ChatMessageResponse;
import com.haui.ZenBook.dto.chat.ChatRoomResponse;
import com.haui.ZenBook.entity.ChatRoomEntity;
import com.haui.ZenBook.entity.MessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roomId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "chatRoom", ignore = true)
    MessageEntity toEntity(ChatMessageRequest request);

    ChatMessageResponse toResponse(MessageEntity entity);
    List<ChatMessageResponse> toResponseList(List<MessageEntity> entities);

    // 👉 MÓC DỮ LIỆU TỪ USER SANG ROOM RESPONSE
    @Mapping(source = "user.fullName", target = "customerName", defaultValue = "Khách hàng ZenBook")
    @Mapping(source = "user.email", target = "customerEmail")
    @Mapping(source = "user.avatar", target = "customerAvatar")
    @Mapping(source = "user.membership.tier", target = "customerTier")
    ChatRoomResponse toRoomResponse(ChatRoomEntity entity);

    List<ChatRoomResponse> toRoomResponseList(List<ChatRoomEntity> entities);
}