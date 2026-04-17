package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.entity.CouponEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CouponMapper {
    CouponResponse toResponse(CouponEntity entity);
    CouponEntity toEntity(CouponRequest request);
    void updateEntity(CouponRequest request, @MappingTarget CouponEntity entity);
}