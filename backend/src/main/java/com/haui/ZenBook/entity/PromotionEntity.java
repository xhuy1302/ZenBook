package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.PromotionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "promotions")
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "books")
public class PromotionEntity extends BaseEntity {
    private String name;
    private String description;
    @Enumerated(EnumType.STRING)
    private DiscountType discountType;
    private Double discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    @Enumerated(EnumType.STRING)
    private PromotionStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "promotion_books",
            joinColumns = @JoinColumn(name = "promotion_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private Set<BookEntity> books;
    private boolean deleted = false;
}