package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.publisher.PublisherCreationRequest;
import com.haui.ZenBook.dto.publisher.PublisherResponse;
import com.haui.ZenBook.dto.publisher.PublisherUpdateRequest;
import com.haui.ZenBook.service.PublisherService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/publishers") // 👉 Đã sửa endpoint từ /suppliers thành /publishers
@RequiredArgsConstructor
public class PublisherController {

    private final MessageUtil messageUtil;
    private final PublisherService publisherService; // 👉 Đã đổi tên biến

    @PostMapping
    public ApiResponse<PublisherResponse> createPublisher(@Valid @RequestBody PublisherCreationRequest request) {
        return ApiResponse.<PublisherResponse>builder()
                .data(publisherService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @GetMapping
    public ApiResponse<List<PublisherResponse>> getAll() {
        return ApiResponse.<List<PublisherResponse>>builder()
                .data(publisherService.getAllPublishers())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PublisherResponse> getPublisher(@PathVariable String id) {
        return ApiResponse.<PublisherResponse>builder()
                .data(publisherService.getPublisherById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<PublisherResponse> updatePublisher(
            @PathVariable String id,
            @Valid @RequestBody PublisherUpdateRequest request) {
        return ApiResponse.<PublisherResponse>builder()
                .data(publisherService.updatePublisher(id, request))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> hardDelete(@PathVariable String id) {
        publisherService.hardDeletePublisher(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @DeleteMapping("/soft-delete/{id}")
    public ApiResponse<Void> softDelete(@PathVariable String id) {
        publisherService.softDeletePublisher(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<PublisherResponse>> getAllSD() {
        return ApiResponse.<List<PublisherResponse>>builder()
                .data(publisherService.getAllPublishersSD())
                .build();
    }

    @PatchMapping("/restore/{id}")
    public ApiResponse<Void> restore(@PathVariable String id) {
        publisherService.restorePublisher(id);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }
}