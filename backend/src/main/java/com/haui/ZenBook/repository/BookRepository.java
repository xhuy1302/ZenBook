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

    // ==========================================
    // AI CHATBOT SEARCH QUERIES
    // ==========================================

    // 👉 Hàm tìm kiếm cơ bản (giữ lại theo code cũ của bạn)
    @Query("""
        SELECT DISTINCT new com.haui.ZenBook.chatbot.tool.dto.AiBookDto$SearchResponse(
            b.id, 
            b.title, 
            b.salePrice, 
            b.stockQuantity,
            b.slug
        )
        FROM BookEntity b 
        LEFT JOIN b.authors a
        LEFT JOIN b.categories c
        WHERE (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) 
           OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR :keyword = '' OR :keyword IS NULL)
          AND b.status = 'ACTIVE' AND b.deletedAt IS NULL
    """)
    List<AiBookDto.SearchResponse> searchBooksForAi(@Param("keyword") String keyword, Pageable pageable);

    // 👉 Hàm tìm kiếm NÂNG CẤP: Tìm theo từ khóa (kể cả tác giả, thể loại) + LỌC KHOẢNG GIÁ
    @Query("""
        SELECT DISTINCT new com.haui.ZenBook.chatbot.tool.dto.AiBookDto$SearchResponse(
            b.id, 
            b.title, 
            b.salePrice, 
            b.stockQuantity,
            b.slug
        )
        FROM BookEntity b 
        LEFT JOIN b.authors a
        LEFT JOIN b.categories c
        WHERE (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) 
               OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR :keyword = '' OR :keyword IS NULL)
          AND (:minPrice IS NULL OR b.salePrice >= :minPrice)
          AND (:maxPrice IS NULL OR b.salePrice <= :maxPrice)
          AND b.status = 'ACTIVE' AND b.deletedAt IS NULL
    """)
    List<AiBookDto.SearchResponse> searchBooksWithPriceForAi(
            @Param("keyword") String keyword,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );

    // ==========================================
    // USER BEHAVIOR QUERIES (Dùng cho Recommender System)
    // ==========================================

    @Query("SELECT DISTINCT c.id FROM OrderEntity o JOIN o.details od JOIN od.book b JOIN b.categories c WHERE o.userId = :userId")
    List<String> findCategoryIdsFromUserOrders(@Param("userId") String userId);

    @Query("SELECT DISTINCT c.id FROM WishlistEntity w JOIN w.book b JOIN b.categories c WHERE w.user.id = :userId")
    List<String> findCategoryIdsFromUserWishlist(@Param("userId") String userId);

    @EntityGraph(attributePaths = {"authors", "categories", "publisher", "promotions", "images"})
    @Query("SELECT DISTINCT b FROM BookEntity b JOIN b.categories c " +
            "WHERE c.id IN :categoryIds " +
            "AND b.status = 'ACTIVE' AND b.deletedAt IS NULL " +
            "ORDER BY b.soldQuantity DESC, b.views DESC")
    List<BookEntity> findPersonalizedBooks(@Param("categoryIds") List<String> categoryIds, Pageable pageable);
}