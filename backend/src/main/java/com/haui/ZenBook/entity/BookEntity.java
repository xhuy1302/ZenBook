package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.BookStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "books")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BookEntity extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "isbn", unique = true)
    private String isbn;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "original_price", nullable = false)
    private Double originalPrice;

    @Column(name = "sale_price", nullable = false)
    private Double salePrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0; // Gán mặc định = 0 để an toàn khi cộng kho

    @Column(name = "sold_quantity")
    private Integer soldQuantity = 0;

    @Column(name = "thumbnail")
    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "views")
    private Integer views = 0; // Thêm trường này để tính sách thịnh hành

    @Column(name = "average_rating")
    private Double rating = 0.0; // Điểm đánh giá trung bình (1.0 -> 5.0)

    @Column(name = "total_reviews")
    private Integer reviews = 0; // Số lượng người đã đánh giá

    @Column(name = "award")
    private String award; // Tên giải thưởng (Nếu có) - Dùng cho tab Award Winners

    // 👉 THÊM MỚI: Mối quan hệ N-1 với Nhà xuất bản (Publisher)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id")
    private PublisherEntity publisher;

    // --- Mối quan hệ với Chi tiết phiếu nhập ---
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY)
    private List<ReceiptDetailEntity> receiptDetails;

    // --- Mối quan hệ N-N với Category ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_categories",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<CategoryEntity> categories;

    // --- Mối quan hệ N-N với Author ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_authors",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private Set<AuthorEntity> authors;

    // --- Mối quan hệ N-N với Tag ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_tags",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<TagEntity> tags;

    @OneToOne(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private BookSpecificationEntity specification;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BookImageEntity> images;

    @ManyToMany(mappedBy = "books", fetch = FetchType.LAZY)
    private List<PromotionEntity> promotions;

    @ManyToMany(mappedBy = "books", fetch = FetchType.LAZY)
    private Set<NewsEntity> relatedNews;
}