package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.BookFormat;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "book_specifications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BookSpecificationEntity extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "format")
    private BookFormat format;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "dimensions")
    private String dimensions;

    @Column(name = "weight")
    private Integer weight;

    @Column(name = "language")
    private String language;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private BookEntity book;
}