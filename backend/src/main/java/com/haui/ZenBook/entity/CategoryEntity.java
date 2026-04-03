package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.CategoryStatus;
import com.haui.ZenBook.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "categories")
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "category_name", nullable = false)
    String categoryName;

    @Column(name = "slug", nullable = false, unique = true)
    String slug;

    @Column(name = "category_desc", columnDefinition = "TEXT")
    String categoryDesc;

    @Column(name = "parent_id")
    String parentId;

    @Column(name = "level", nullable = false)
    Integer level;

    @Column(name = "thumbnail_url")
    String thumbnailUrl;

    @Column(name = "display_order", nullable = false)
    Integer displayOrder;

    @Column(name = "is_featured", nullable = false)
    Boolean isFeatured;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @lombok.Builder.Default
    private CategoryStatus status = CategoryStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    // ✅ Thêm quan hệ để dễ lấy danh sách danh mục con nếu cần
    @OneToMany
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    List<CategoryEntity> children;

    // ✅ Tự động gán thời gian tạo
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (level == null) level = 0;
        if (displayOrder == null) displayOrder = 0;
        if (isFeatured == null) isFeatured = false;
        if (status == null) status = CategoryStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}