package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.CouponEntity;
import com.haui.ZenBook.enums.CouponStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<CouponEntity, String> {

    // Phục vụ CRUD Admin
    boolean existsByCodeAndDeletedAtIsNull(String code);

    Optional<CouponEntity> findByCodeAndDeletedAtIsNull(String code);

    Optional<CouponEntity> findByCodeAndStatus(String code, CouponStatus status);

    // ĐÃ SỬA: Bỏ Pageable, trả về List và sắp xếp giảm dần theo thời gian tạo
    List<CouponEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    // ĐÃ SỬA: Bỏ Pageable, trả về List và sắp xếp giảm dần theo thời gian xóa (Dành cho Thùng rác)
    List<CouponEntity> findAllByDeletedAtIsNotNullOrderByDeletedAtDesc();

    // Phục vụ Validate Đặt hàng (PESSIMISTIC_WRITE để chống Race Condition)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CouponEntity c WHERE c.code = :code AND c.deletedAt IS NULL")
    Optional<CouponEntity> findByCodeForUpdate(@Param("code") String code);

    // Lấy mã Public (dùng cho khách vãng lai)
    List<CouponEntity> findAllByStatusAndUserIdIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(CouponStatus status);

    // Lấy mã Public + Mã riêng của user đang đăng nhập
    @Query("SELECT c FROM CouponEntity c WHERE c.status = 'ACTIVE' AND c.deletedAt IS NULL AND (c.userId IS NULL OR c.userId = :userId) ORDER BY c.createdAt DESC")
    List<CouponEntity> findAllActiveForUser(@Param("userId") String userId);
    boolean existsByUserIdAndCodeLike(String userId, String pattern);
}