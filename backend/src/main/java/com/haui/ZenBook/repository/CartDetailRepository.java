package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.CartDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartDetailRepository extends JpaRepository<CartDetailEntity, String> {
    Optional<CartDetailEntity> findByCartIdAndBookId(String cartId, String bookId);
}