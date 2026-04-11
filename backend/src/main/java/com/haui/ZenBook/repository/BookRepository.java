package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, String>, JpaSpecificationExecutor<BookEntity> {
    Optional<BookEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByIsbn(String isbn);

    List<BookEntity> findByDeletedAtIsNullOrderByCreatedAtDesc();

    // ĐÃ SỬA: Trả về List và tự động sort theo DeletedAt mới nhất
    List<BookEntity> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<BookEntity> findByStockQuantityLessThanAndDeletedAtIsNullOrderByStockQuantityAsc(int stockQuantity);

    @Query("SELECT COUNT(b) FROM BookEntity b WHERE b.stockQuantity < 5 AND b.deletedAt IS NULL")
    long countLowStockBooks();
}