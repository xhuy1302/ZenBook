package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.BookImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookImageRepository extends JpaRepository<BookImageEntity, String> {
    List<BookImageEntity> findAllByBookId(String bookId);
}