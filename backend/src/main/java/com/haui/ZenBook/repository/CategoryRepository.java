package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, String> {

    Optional<CategoryEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<CategoryEntity> findAllByLevelOrderByDisplayOrderAsc(Integer level);

    List<CategoryEntity> findAllByParentIdOrderByDisplayOrderAsc(String parentId);

    List<CategoryEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    @Query("SELECT c FROM CategoryEntity c WHERE c.isFeatured = true AND c.status = 'ACTIVE' ORDER BY c.displayOrder ASC")
    List<CategoryEntity> findFeaturedCategories();

    @Query("SELECT MAX(c.displayOrder) FROM CategoryEntity c WHERE c.parentId = :parentId")
    Integer findMaxDisplayOrderByParentId(String parentId);

    @Query("SELECT MAX(c.displayOrder) FROM CategoryEntity c WHERE c.parentId IS NULL")
    Integer findMaxDisplayOrderRoot();

    @Query("SELECT c.categoryName, SUM(od.quantity) " +
            "FROM OrderDetailEntity od " +
            "JOIN od.book b " +
            "JOIN b.categories c " +
            "JOIN od.order o " +
            "WHERE o.status != 'CANCELLED' " + // Tùy chọn: Không tính các đơn đã hủy
            "GROUP BY c.categoryName " +
            "ORDER BY SUM(od.quantity) DESC")
    List<Object[]> getSalesByCategoryRaw();
}