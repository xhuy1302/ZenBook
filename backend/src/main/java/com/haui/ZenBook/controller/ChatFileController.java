package com.haui.ZenBook.controller;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.enums.MessageType;
import com.haui.ZenBook.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/support-chat/files")
@RequiredArgsConstructor
public class ChatFileController {

    private final ChatService chatService;

    @PostMapping("/upload-media")
    public ApiResponse<String> uploadChatMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("senderId") String senderId,
            @RequestParam(value = "receiverId", required = false) String receiverId,
            @RequestParam("isAdmin") boolean isAdmin,
            @RequestParam("messageType") MessageType messageType) {

        chatService.processFileMessage(file, senderId, receiverId, isAdmin, messageType);

        // 👉 ĐÃ SỬA: Dùng ApiResponse cho đồng bộ với toàn hệ thống
        return ApiResponse.<String>builder()
                .message("Đã gửi file thành công!")
                .build();
    }
}