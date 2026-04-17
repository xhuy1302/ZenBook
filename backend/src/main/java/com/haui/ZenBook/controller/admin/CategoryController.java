package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.category.CategoryCreationRequest;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.dto.category.CategoryUpdateRequest; // Thêm cái này
import com.haui.ZenBook.dto.category.CategoryUpdateResponse; // Thêm cái này
import com.haui.ZenBook.service.CategoryService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    MessageUtil messageUtil;
    CategoryService categoryService;

    // 1. Tạo mới danh mục
    @PostMapping
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CategoryCreationRequest request) {
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setData(categoryService.create(request));
        apiResponse.setMessage(messageUtil.getMessage("created.success"));
        return apiResponse;
    }

    // 2. Lấy toàn bộ danh sách danh mục (Active - Phẳng)
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getAllCategories())
                .build();
    }

    // 3. Lấy cấu trúc cây danh mục
    @GetMapping("/tree")
    public ApiResponse<List<CategoryResponse>> getTree() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getCategoryTree())
                .build();
    }

    // 4. Lấy chi tiết một danh mục
    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getById(@PathVariable String id) {
        return ApiResponse.<CategoryResponse>builder()
                .data(categoryService.getCategoryById(id))
                .build();
    }

    // 5. Cập nhật danh mục - SỬA Ở ĐÂY
    @PutMapping("/{id}")
    public ApiResponse<CategoryUpdateResponse> update(
            @PathVariable String id,
            @Valid @RequestBody CategoryUpdateRequest request) { // Đổi thành CategoryUpdateRequest
        return ApiResponse.<CategoryUpdateResponse>builder() // Đổi kiểu trả về thành CategoryUpdateResponse
                .data(categoryService.update(id, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 6. Xóa vĩnh viễn (Hard Delete)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDelete(@PathVariable String id) {
        categoryService.hardDeleteCategory(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 7. Xóa mềm (Cho vào thùng rác)
    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDelete(@PathVariable String id) {
        categoryService.softDeleteCategory(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 8. Lấy danh sách danh mục trong thùng rác
    @GetMapping("/trash")
    public ApiResponse<List<CategoryResponse>> getTrash() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getAllCategoriesSD())
                .build();
    }

    // 9. Khôi phục danh mục từ thùng rác
    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restore(@PathVariable String id) {
        categoryService.restoreCategory(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
    // 10. Upload Thumbnail cho danh mục
    @PostMapping("/{id}/thumbnail")
    public ApiResponse<String> uploadThumbnail(
            @PathVariable String id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        // Gọi service để xử lý lưu file (S3 hoặc local) và trả về URL
        String thumbnailUrl = categoryService.uploadThumbnail(id, file);

        return ApiResponse.<String>builder()
                .data(thumbnailUrl)
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }
}