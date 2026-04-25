package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.publisher.PublisherFilterResponse;
import com.haui.ZenBook.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("customerPublisherController")
@RequestMapping("/api/v1/customer/publishers")
@RequiredArgsConstructor
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping("/filter")
    public ApiResponse<List<PublisherFilterResponse>> getPublishersForFilter() {
        return ApiResponse.<List<PublisherFilterResponse>>builder()
                .data(publisherService.getPublishersForFilter())
                .message("Lấy danh sách nhà xuất bản thành công")
                .build();
    }
}