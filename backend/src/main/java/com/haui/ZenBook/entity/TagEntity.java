package com.haui.ZenBook.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "tags")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TagEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name; // Ví dụ: "Sách bán chạy", "Quà tặng"

    @Column(name = "slug", nullable = false, length = 100, unique = true)
    private String slug; // Ví dụ: "sach-ban-chay"

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "color", length = 20)
    private String color; // Mã màu hex để hiển thị label trên web (VD: #ef4444)

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Quan hệ Many-to-Many ngược lại với Book
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    private Set<BookEntity> books;
}