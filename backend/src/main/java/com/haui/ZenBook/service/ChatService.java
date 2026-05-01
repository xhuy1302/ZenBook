package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.chat.ChatMessageRequest;
import com.haui.ZenBook.dto.chat.ChatMessageResponse;
import com.haui.ZenBook.dto.chat.ChatRoomResponse;
import com.haui.ZenBook.enums.MessageType;
import com.haui.ZenBook.enums.RoomStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ChatService {
    void processMessage(ChatMessageRequest request, boolean isAdmin);

    void processFileMessage(MultipartFile file, String senderId, String receiverId, boolean isAdmin, MessageType type);

    List<ChatMessageResponse> getChatHistory(String roomId, int page, int size);

    // 👉 Thêm 2 hàm này để gọi từ Controller
    List<ChatRoomResponse> getAllRoomsForAdmin();

    void markAsSeen(String roomId, String userId);

    void updateRoomStatus(String roomId, RoomStatus status);
}