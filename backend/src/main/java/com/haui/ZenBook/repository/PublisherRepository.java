package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.PublisherEntity;
import com.haui.ZenBook.enums.PublisherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublisherRepository extends JpaRepository<PublisherEntity, String> {
    List<PublisherEntity> findByStatusNot(PublisherStatus status);
    List<PublisherEntity> findByStatus(PublisherStatus status);

    boolean existsByEmail(String email);
    boolean existsByTaxCode(String taxCode);
}