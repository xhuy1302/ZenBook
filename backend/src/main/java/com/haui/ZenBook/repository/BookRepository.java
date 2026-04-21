package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.enums.BookStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, String>, JpaSpecificationExecutor<BookEntity> {

    Optional<BookEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByIsbn(String isbn);

    boolean existsByTitle(String title);

    boolean existsByTitleAndIdNot(String title, String id);

    List<BookEntity> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<BookEntity> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<BookEntity> findByStockQuantityLessThanAndDeletedAtIsNullOrderByStockQuantityAsc(int stockQuantity);

    @Query("SELECT COUNT(b) FROM BookEntity b WHERE b.stockQuantity < 5 AND b.deletedAt IS NULL")
    long countLowStockBooks();

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL ORDER BY b.createdAt DESC")
    List<BookEntity> findTopRecentBooks(@Param("status") BookStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL ORDER BY b.views DESC")
    List<BookEntity> findTopTrendingBooks(@Param("status") BookStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL AND b.award IS NOT NULL AND b.award != '' ORDER BY b.createdAt DESC")
    List<BookEntity> findTopAwardBooks(@Param("status") BookStatus status, Pageable pageable);
}