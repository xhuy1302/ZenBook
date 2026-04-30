package com.haui.ZenBook.repository;

import com.haui.ZenBook.chatbot.tool.dto.AiBookDto;
import com.haui.ZenBook.dto.book.PriceRangeResponse;
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

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions", "images"})
    Optional<BookEntity> findBySlug(String slug);

    @Query("SELECT COALESCE(MIN(b.salePrice), 0.0), COALESCE(MAX(b.salePrice), 500000.0) FROM BookEntity b WHERE b.deletedAt IS NULL")
    List<Object[]> getPriceRange();

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Override
    Optional<BookEntity> findById(String id);

    boolean existsBySlug(String slug);

    boolean existsByIsbn(String isbn);

    boolean existsByTitle(String title);

    boolean existsByTitleAndIdNot(String title, String id);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    List<BookEntity> findByDeletedAtIsNullOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    List<BookEntity> findByDeletedAtIsNotNullOrderByDeletedAtDesc();

    List<BookEntity> findByStockQuantityLessThanAndDeletedAtIsNullOrderByStockQuantityAsc(int stockQuantity);

    @Query("SELECT COUNT(b) FROM BookEntity b WHERE b.stockQuantity < 5 AND b.deletedAt IS NULL")
    long countLowStockBooks();

    @Query("SELECT new com.haui.ZenBook.dto.book.PriceRangeResponse(MIN(b.salePrice), MAX(b.salePrice)) " +
            "FROM BookEntity b WHERE b.status = 'ACTIVE'")
    PriceRangeResponse getStorePriceRange();

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL ORDER BY b.createdAt DESC")
    List<BookEntity> findTopRecentBooks(@Param("status") BookStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL ORDER BY b.views DESC")
    List<BookEntity> findTopTrendingBooks(@Param("status") BookStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions"})
    @Query("SELECT b FROM BookEntity b WHERE b.status = :status AND b.deletedAt IS NULL AND b.award IS NOT NULL AND b.award != '' ORDER BY b.createdAt DESC")
    List<BookEntity> findTopAwardBooks(@Param("status") BookStatus status, Pageable pageable);
    // Lấy sách sắp hết hàng (<= 50)
    List<BookEntity> findTop10ByStockQuantityLessThanEqualOrderByStockQuantityAsc(int threshold);

    @Query("""
        SELECT DISTINCT new com.haui.ZenBook.chatbot.tool.dto.AiBookDto$SearchResponse(
            b.id, 
            b.title, 
            b.salePrice, 
            b.stockQuantity
        )
        FROM BookEntity b 
        LEFT JOIN b.authors a
        WHERE (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) 
           OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND b.status = 'ACTIVE'
    """)
    List<AiBookDto.SearchResponse> searchBooksForAi(@Param("keyword") String keyword, Pageable pageable);
}