package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.user.*;
import com.haui.ZenBook.entity.RoleEntity;
import com.haui.ZenBook.entity.UserEntity;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // =========================================================================
    // ── KHU VỰC 1: DÀNH CHO QUẢN TRỊ VIÊN (ADMIN) ──
    // =========================================================================

    UserEntity toEntity(UserCreationRequest request);

    @Mapping(target = "roles", expression = "java(mapRoleNames(userEntity))")
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

    // =========================================================================
    // ── KHU VỰC 2: DÀNH CHO GIAO DIỆN KHÁCH HÀNG (CUSTOMER) ──
    // =========================================================================

    /**
     * Entity → DTO trả về cho Frontend.
     * @Mapping avatarUrl ← avatar  vì tên field lệch nhau.
     */
    @Mapping(target = "avatarUrl", source = "avatar")
    @Mapping(target = "roles", expression = "java(mapRolesToList(entity.getRoles()))")
    UserProfileResponse toUserProfileResponse(UserEntity entity);

    default List<String> mapRolesToList(Set<RoleEntity> roles) {
        return (roles == null)
                ? null
                : roles.stream()
                .map(RoleEntity::getName)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật profile khách hàng.
     *
     * - IGNORE null: nếu request gửi null → giữ nguyên giá trị cũ trong DB.
     * - Các field nhạy cảm (id, email, password, avatar, roles, addresses,
     *   username, status, createdAt, deletedAt) bị ignore hoàn toàn —
     *   không bao giờ bị ghi đè qua endpoint này.
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "email",      ignore = true)
    @Mapping(target = "password",   ignore = true)
    @Mapping(target = "avatar",     ignore = true)  // avatar được cập nhật riêng qua uploadAvatar()
    @Mapping(target = "roles",      ignore = true)
    @Mapping(target = "addresses",  ignore = true)
    @Mapping(target = "username",   ignore = true)  // username không đổi sau khi đăng ký
    @Mapping(target = "status",     ignore = true)
    @Mapping(target = "createdAt",  ignore = true)
    @Mapping(target = "deletedAt",  ignore = true)
    @Mapping(target = "phone",      ignore = true)  // phone cập nhật riêng qua updatePhone()
    void updateCustomerProfile(@MappingTarget UserEntity entity,
                               CustomerProfileUpdateRequest request);
}