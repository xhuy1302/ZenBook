package com.haui.ZenBook.repository;

import com.haui.ZenBook.dto.publisher.PublisherFilterResponse;
import com.haui.ZenBook.entity.PublisherEntity;
import com.haui.ZenBook.enums.PublisherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublisherRepository extends JpaRepository<PublisherEntity, String> {
    List<PublisherEntity> findByStatusNot(PublisherStatus status);
    List<PublisherEntity> findByStatus(PublisherStatus status);

    boolean existsByEmail(String email);
    boolean existsByTaxCode(String taxCode);
    @Query("SELECT new com.haui.ZenBook.dto.publisher.PublisherFilterResponse(p.id, p.name, COUNT(b.id)) " +
            "FROM PublisherEntity p LEFT JOIN p.books b " +
            "GROUP BY p.id, p.name")
    List<PublisherFilterResponse> getPublishersForFilter();
}