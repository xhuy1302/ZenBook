package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {

    // Kiểm tra trùng tên khi tạo mới
    boolean existsByName(String name);

    // Kiểm tra trùng tên khi cập nhật (bỏ qua thẻ hiện tại đang sửa)
    boolean existsByNameAndIdNot(String name, String id);

    // Lấy danh sách thẻ đang hoạt động (chưa xóa mềm)
    List<TagEntity> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    // Lấy danh sách thẻ trong thùng rác (đã xóa mềm)
    List<TagEntity> findAllByDeletedAtIsNotNullOrderByCreatedAtDesc();
}