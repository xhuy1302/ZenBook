package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.author.AuthorCreationRequest;
import com.haui.ZenBook.dto.author.AuthorResponse;
import com.haui.ZenBook.dto.author.AuthorUpdateRequest;
import com.haui.ZenBook.dto.author.AuthorUpdateResponse;
import com.haui.ZenBook.entity.AuthorEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AuthorMapper {

    // ================= CREATE =================
    AuthorEntity toEntity(AuthorCreationRequest request);

    // ================= RESPONSE =================
    AuthorResponse toResponse(AuthorEntity entity);

    AuthorUpdateResponse toUpdateResponse(AuthorEntity entity);

    // ================= UPDATE =================
//    @Mapping(target = "id", ignore = true)
//    @Mapping(target = "email", ignore = true) // không cho sửa email
//    @Mapping(target = "createdAt", ignore = true)
//    @Mapping(target = "deletedAt", ignore = true)

    void updateAuthor(@MappingTarget AuthorEntity entity, AuthorUpdateRequest request);
}