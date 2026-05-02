package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartEntity, String> {
    // 👉 Đổi từ findByUserId thành findByUserEmail
    Optional<CartEntity> findByUserEmail(String email);
    Optional<CartEntity> findByUserId(String userId);
}