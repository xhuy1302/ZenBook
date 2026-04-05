package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.BookEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, String>, JpaSpecificationExecutor<BookEntity> {
    Optional<BookEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByIsbn(String isbn);
}