package com.haui.ZenBook.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receipt_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private ReceiptEntity receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private BookEntity book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "import_price", nullable = false)
    private Double importPrice;

    @Column(name = "sub_total")
    private Double subTotal;
}