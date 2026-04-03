package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
}