package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.NewsEntity;
import com.haui.ZenBook.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<NewsEntity, String> {

    // --- KIỂM TRA TỒN TẠI ---
    boolean existsByTitle(String title);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, String id); // Dùng khi Update để tránh check trùng với chính nó

    // --- LẤY DỮ LIỆU ---
    Optional<NewsEntity> findBySlugAndDeletedAtIsNull(String slug);
    Optional<NewsEntity> findByIdAndDeletedAtIsNull(String id);

    // Lấy danh sách không nằm trong thùng rác
    List<NewsEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    // Lấy danh sách theo trạng thái (VD: Chỉ lấy PUBLISHED hiển thị cho user)
    List<NewsEntity> findAllByStatusAndDeletedAtIsNullOrderByPublishedAtDesc(NewsStatus status);

    // --- XỬ LÝ XÓA MỀM (THÙNG RÁC) ---
    // Lấy danh sách trong thùng rác
    List<NewsEntity> findAllByDeletedAtIsNotNullOrderByDeletedAtDesc();

    @Modifying
    @Query("""
        update NewsEntity n
        set n.status = 'HIDDEN',
            n.deletedAt = :deletedAt
        where n.id = :id
          and n.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update NewsEntity n
        set n.status = 'DRAFT', 
            n.deletedAt = null
        where n.id = :id
          and n.deletedAt is not null
    """)
    int restore(@Param("id") String id);
}