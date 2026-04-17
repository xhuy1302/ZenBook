package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.category.CategoryCreationRequest;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.dto.category.CategoryUpdateRequest;
import com.haui.ZenBook.dto.category.CategoryUpdateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {

    // 1. Tạo mới danh mục
    CategoryResponse create(CategoryCreationRequest request);

    // 2. Lấy toàn bộ danh sách danh mục (Active - Danh sách phẳng)
    List<CategoryResponse> getAllCategories();

    // 3. Lấy cấu trúc cây danh mục (Dạng lồng nhau Parent -> Children)
    List<CategoryResponse> getCategoryTree();

    // 4. Lấy chi tiết một danh mục
    CategoryResponse getCategoryById(String id);

    // 5. Cập nhật danh mục (Sử dụng DTO Update chuyên biệt)
    CategoryUpdateResponse update(String id, CategoryUpdateRequest request);

    // 6. Xóa vĩnh viễn (Hard Delete khỏi Database)
    void hardDeleteCategory(String id);

    // 7. Xóa mềm (Chuyển vào thùng rác bằng cách set deletedAt)
    void softDeleteCategory(String id);

    // 8. Lấy danh sách danh mục trong thùng rác (Deleted)
    List<CategoryResponse> getAllCategoriesSD();

    // 9. Khôi phục danh mục từ thùng rác
    void restoreCategory(String id);

    String uploadThumbnail(String id, MultipartFile file);
}