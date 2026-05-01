package com.haui.ZenBook.controller;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.chat.ChatMessageResponse;
import com.haui.ZenBook.dto.chat.ChatRoomResponse;
import com.haui.ZenBook.enums.RoomStatus;
import com.haui.ZenBook.mapper.ChatMapper;
import com.haui.ZenBook.repository.ChatRoomRepository;
import com.haui.ZenBook.service.ChatService;
import com.haui.ZenBook.util.MessageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/support-chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatService chatService;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMapper chatMapper;
    private final MessageUtil messageUtil;

    // 1. Lấy lịch sử tin nhắn của một phòng
    @GetMapping("/{roomId}/history")
    public ApiResponse<List<ChatMessageResponse>> getChatHistory(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .data(chatService.getChatHistory(roomId, page, size))
                .build();
    }

    // 2. Lấy toàn bộ phòng chat cho Admin
    @GetMapping("/admin/all")
    public ApiResponse<List<ChatRoomResponse>> getAllRoomsForAdmin() {
        // 👉 ĐÃ SỬA: Gọi qua Service để chạy thuật toán đếm tin nhắn và xếp hạng VIP
        return ApiResponse.<List<ChatRoomResponse>>builder()
                .data(chatService.getAllRoomsForAdmin())
                .build();
    }

    // 3. Lấy thông tin phòng dựa trên UserId
    @GetMapping("/user/{userId}")
    public ApiResponse<ChatRoomResponse> getRoomByUserId(@PathVariable String userId) {
        ChatRoomResponse room = chatRoomRepository.findByUserId(userId)
                .map(chatMapper::toRoomResponse)
                .orElse(null);

        return ApiResponse.<ChatRoomResponse>builder()
                .data(room)
                .build();
    }

    // 👉 4. THÊM API MỚI: Đánh dấu đã xem (Seen)
    @PutMapping("/{roomId}/seen")
    public ApiResponse<Void> markAsSeen(
            @PathVariable String roomId,
            @RequestParam String userId) {

        chatService.markAsSeen(roomId, userId);
        return ApiResponse.<Void>builder()
                .message("Đã đánh dấu xem tin nhắn")
                .build();
    }
    @PutMapping("/{roomId}/status")
    public ApiResponse<Void> updateRoomStatus(
            @PathVariable String roomId,
            @RequestParam RoomStatus status) {

        chatService.updateRoomStatus(roomId, status);

        return ApiResponse.<Void>builder()
                .message("Đã cập nhật trạng thái cuộc hội thoại thành " + status.name())
                .build();
    }
}