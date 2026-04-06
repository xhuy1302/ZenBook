package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.CategoryStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@SuperBuilder // Sử dụng SuperBuilder để kế thừa Builder từ BaseEntity
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "categories")
public class CategoryEntity extends BaseEntity {

    @Column(name = "category_name", nullable = false)
    String categoryName;

    @Column(name = "slug", nullable = false, unique = true)
    String slug;

    @Column(name = "category_desc", columnDefinition = "TEXT")
    String categoryDesc;

    @Column(name = "parent_id")
    String parentId;

    @Column(name = "level", nullable = false)
    @Builder.Default
    Integer level = 0;

    @Column(name = "thumbnail_url")
    String thumbnailUrl;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    Integer displayOrder = 0;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    Boolean isFeatured = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    CategoryStatus status = CategoryStatus.ACTIVE;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @OneToMany
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    List<CategoryEntity> children;

    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    Set<BookEntity> books;
}