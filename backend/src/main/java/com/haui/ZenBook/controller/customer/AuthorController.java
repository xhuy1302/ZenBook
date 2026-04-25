package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.author.AuthorFilterResponse;
import com.haui.ZenBook.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("customerAuthorController") // Tránh trùng Bean với Admin
@RequestMapping("/api/v1/customer/authors") // Đổi đường dẫn để tách biệt với Admin
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;

    @GetMapping("/filter")
    public ApiResponse<List<AuthorFilterResponse>> getAuthorsForFilter() {
        return ApiResponse.<List<AuthorFilterResponse>>builder()
                .data(authorService.getAuthorsForFilter())
                .message("Lấy danh sách tác giả thành công")
                .build();
    }
}