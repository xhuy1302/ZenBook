package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String>, JpaSpecificationExecutor<ReviewEntity> {

    // Lấy chi tiết review (chỉ lấy những review chưa bị xóa mềm)
    Optional<ReviewEntity> findByIdAndDeletedAtIsNull(String id);

    // Dành cho phía Client: Lấy danh sách review của 1 quyển sách (chỉ lấy review đã được DUYỆT)
    Page<ReviewEntity> findByBookIdAndStatusAndDeletedAtIsNull(String bookId, String status, Pageable pageable);
}