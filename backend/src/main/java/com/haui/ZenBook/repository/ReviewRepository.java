package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReviewEntity;
import com.haui.ZenBook.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository
        extends JpaRepository<ReviewEntity, String>,
        JpaSpecificationExecutor<ReviewEntity> {

    Optional<ReviewEntity> findByIdAndDeletedAtIsNull(String id);

    Page<ReviewEntity> findByBookIdAndStatusAndDeletedAtIsNull(
            String bookId,
            ReviewStatus status,
            Pageable pageable
    );

    boolean existsByBookIdAndUserIdAndDeletedAtIsNull(
            String bookId,
            String userId
    );

    List<ReviewEntity> findByBookIdAndStatusAndDeletedAtIsNull(
            String bookId,
            ReviewStatus status
    );

    boolean existsByOrderDetailIdAndDeletedAtIsNull(
            String orderDetailId
    );
}