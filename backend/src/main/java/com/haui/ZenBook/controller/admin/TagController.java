package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.tag.TagRequest;
import com.haui.ZenBook.dto.tag.TagResponse;
import com.haui.ZenBook.service.TagService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final MessageUtil messageUtil;
    private final TagService tagService;

    // 1. Tạo mới Tag
    @PostMapping
    public ApiResponse<TagResponse> create(@Valid @RequestBody TagRequest request) {
        return ApiResponse.<TagResponse>builder()
                .data(tagService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    // 2. Lấy danh sách toàn bộ Tag (Active)
    @GetMapping
    public ApiResponse<List<TagResponse>> getAll() {
        return ApiResponse.<List<TagResponse>>builder()
                .data(tagService.getAll())
                .build();
    }

    // 3. Cập nhật Tag
    @PutMapping("/{id}")
    public ApiResponse<TagResponse> update(
            @PathVariable String id,
            @Valid @RequestBody TagRequest request) {
        return ApiResponse.<TagResponse>builder()
                .data(tagService.update(id, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    // 4. Xóa vĩnh viễn Tag (Hard Delete)
    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDelete(@PathVariable String id) {
        tagService.hardDelete(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success")) // Hoặc "deleted.permanently"
                .build();
    }

    // 5. Xóa mềm Tag (Cho vào thùng rác)
    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDelete(@PathVariable String id) {
        tagService.softDelete(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    // 6. Lấy danh sách Tag trong thùng rác
    @GetMapping("/trash")
    public ApiResponse<List<TagResponse>> getTrash() {
        return ApiResponse.<List<TagResponse>>builder()
                .data(tagService.getAllTrash())
                .build();
    }

    // 7. Khôi phục Tag từ thùng rác
    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restore(@PathVariable String id) {
        tagService.restore(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
}