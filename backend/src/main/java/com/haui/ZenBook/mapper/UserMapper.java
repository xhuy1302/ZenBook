package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.user.ProfileUpdateRequest;
import com.haui.ZenBook.dto.user.ProfileUpdateResponse;
import com.haui.ZenBook.dto.user.UserCreationRequest;
import com.haui.ZenBook.dto.user.UserResponse;
import com.haui.ZenBook.entity.RoleEntity;
import com.haui.ZenBook.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

        UserEntity toEntity(UserCreationRequest request);

        @Mapping(target = "roles",
                expression = "java(mapRoleNames(userEntity))")
        UserResponse toUserResponse(UserEntity userEntity);

        ProfileUpdateResponse toProfileUpdateResponse(UserEntity userEntity);

        @Mapping(target = "password", ignore = true)
        @Mapping(target = "email", ignore = true)
        @Mapping(target = "roles", ignore = true)
        void updateUser(@MappingTarget UserEntity userEntity, ProfileUpdateRequest request);

        default Set<String> mapRoleNames(UserEntity userEntity) {
            return (userEntity.getRoles() == null)
                    ? null
                    : userEntity.getRoles().stream()
                    .map(RoleEntity::getName)
                    .collect(Collectors.toSet());
        }
}
