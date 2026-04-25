package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.BookSpecificationEntity;
import org.springframework.data.jpa.repository.JpaRepository; // Thêm import này
import java.util.Optional;

// Thêm extends JpaRepository<BookSpecificationEntity, Long> (hoặc String tùy kiểu ID của bạn)
public interface BookSpecificationRepository extends JpaRepository<BookSpecificationEntity, Long> {
    Optional<BookSpecificationEntity> findByBookId(String bookId);
}