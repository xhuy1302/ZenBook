package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.category.CategoryFilterResponse;
import com.haui.ZenBook.dto.category.CategoryResponse;
import com.haui.ZenBook.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("customerCategoryController") // Tránh trùng Bean với Admin
@RequestMapping("/api/v1/customer/categories") // Đổi đường dẫn để tách biệt với Admin
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/filter")
    public ApiResponse<List<CategoryFilterResponse>> getCategoriessForFilter() {
        return ApiResponse.<List<CategoryFilterResponse>>builder()
                .data(categoryService.getCategoriesForFilter())
                .message("Lấy danh sách danh mục thành công")
                .build();
    }

    // Lấy cấu trúc cây danh mục cho giao diện khách hàng (Menu Sidebar)
    @GetMapping("/tree")
    public ApiResponse<List<CategoryResponse>> getCategoryTree() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .data(categoryService.getCategoryTree())
                .message("Lấy cấu trúc cây danh mục thành công")
                .build();
    }
}