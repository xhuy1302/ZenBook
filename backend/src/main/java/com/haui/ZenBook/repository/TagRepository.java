package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {
    Optional<TagEntity> findBySlug(String slug);
}