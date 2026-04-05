package com.haui.ZenBook.entity;

import com.haui.ZenBook.enums.AuthorStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "authors")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorEntity extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "date_of_birth")
    private LocalDateTime dateOfBirth;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(name = "avatar", length = 500)
    private String avatar;

    @Column(name = "email", length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @lombok.Builder.Default
    private AuthorStatus status = AuthorStatus.ACTIVE;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToMany(mappedBy = "authors", fetch = FetchType.LAZY)
    private java.util.Set<BookEntity> books;
}