package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.WishlistEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistEntity, String> {

    // 🔥 SỬA Ở ĐÂY: Thêm LEFT JOIN FETCH b.promotions
    @Query("SELECT w FROM WishlistEntity w JOIN FETCH w.book b LEFT JOIN FETCH b.promotions WHERE w.user.id = :userId")
    List<WishlistEntity> findAllByUserIdWithBook(@Param("userId") String userId);

    Optional<WishlistEntity> findByUserIdAndBookId(String userId, String bookId);

    boolean existsByUserIdAndBookId(String userId, String bookId);

    long countByUserId(String userId);

    @Modifying
    @Query("DELETE FROM WishlistEntity w WHERE w.user.id = :userId AND w.book.id = :bookId")
    void deleteByUserIdAndBookId(@Param("userId") String userId, @Param("bookId") String bookId);

    @Query("SELECT w FROM WishlistEntity w " +
            "JOIN FETCH w.book b " +
            "LEFT JOIN FETCH b.promotions " +
            "WHERE w.user.id = :userId AND (:keyword IS NULL OR :keyword = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<WishlistEntity> searchAndSortWishlist(@Param("userId") String userId, @Param("keyword") String keyword, Sort sort);
}