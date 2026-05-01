package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.chat.ChatMessageRequest;
import com.haui.ZenBook.dto.chat.ChatMessageResponse;
import com.haui.ZenBook.dto.chat.ChatRoomResponse;
import com.haui.ZenBook.entity.ChatRoomEntity;
import com.haui.ZenBook.entity.MessageEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.MessageStatus; // 👉 IMPORT MỚI
import com.haui.ZenBook.enums.MessageType;   // 👉 IMPORT MỚI
import com.haui.ZenBook.enums.RoomStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ChatMapper;
import com.haui.ZenBook.repository.ChatRoomRepository;
import com.haui.ZenBook.repository.MessageRepository;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final S3Service s3Service;

    private static final String SYSTEM_ADMIN_ID = "00000000-0000-7000-0000-000000000100";

    @Override
    @Transactional
    public void processMessage(ChatMessageRequest request, boolean isAdmin) {
        UserEntity sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean isStoreActor = sender.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("STAFF"));

        String customerId = isStoreActor ? request.getReceiverId() : request.getSenderId();

        ChatRoomEntity room = chatRoomRepository.findByUserId(customerId)
                .orElseGet(() -> chatRoomRepository.save(ChatRoomEntity.builder()
                        .userId(customerId)
                        .adminId(isStoreActor ? sender.getId() : null)
                        .build()));

        if (isStoreActor && room.getAdminId() == null) {
            room.setAdminId(sender.getId());
        }

        String actualReceiverId;
        if (isStoreActor) {
            actualReceiverId = customerId;
        } else {
            actualReceiverId = (room.getAdminId() != null) ? room.getAdminId() : SYSTEM_ADMIN_ID;
        }

        MessageEntity message = chatMapper.toEntity(request);
        message.setRoomId(room.getId());
        message.setSenderId(sender.getId());
        message.setReceiverId(actualReceiverId);
        message.setCreatedAt(LocalDateTime.now());

        messageRepository.save(message);

        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        ChatMessageResponse response = chatMapper.toResponse(message);
        messagingTemplate.convertAndSend("/topic/messages." + actualReceiverId, response);
        messagingTemplate.convertAndSend("/topic/messages." + sender.getId(), response);
    }

    @Override
    public List<ChatMessageResponse> getChatHistory(String roomId, int page, int size) {
        var messages = messageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, org.springframework.data.domain.PageRequest.of(page, size));
        var response = chatMapper.toResponseList(messages.getContent());
        Collections.reverse(response);
        return response;
    }

    @Override
    @Transactional
    public void processFileMessage(MultipartFile file, String senderId, String receiverId, boolean isAdmin, MessageType type) {
        try {
            String fileUrl = s3Service.uploadFile(file, "chat-media");
            this.processMessage(ChatMessageRequest.builder()
                    .senderId(senderId).receiverId(receiverId)
                    .content(fileUrl).messageType(type).isAdmin(isAdmin).build(), isAdmin);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Override
    public List<ChatRoomResponse> getAllRoomsForAdmin() {
        List<ChatRoomEntity> rooms = chatRoomRepository.findAllByOrderByUpdatedAtDesc();

        List<ChatRoomResponse> responseList = new java.util.ArrayList<>(rooms.stream().map(room -> {
            ChatRoomResponse res = chatMapper.toRoomResponse(room);

            // 1. Đếm tin nhắn chưa đọc
            String currentAdminId = room.getAdminId() != null ? room.getAdminId() : SYSTEM_ADMIN_ID;
            long unread = messageRepository.countByRoomIdAndReceiverIdAndStatus(
                    room.getId(), currentAdminId, MessageStatus.SENT // 👉 ĐÃ SỬA
            );
            res.setUnreadCount(unread);

            // 2. Map Hạng thành viên sang Độ ưu tiên (Priority)
            String tier = res.getCustomerTier() != null ? res.getCustomerTier().toUpperCase() : "MEMBER";
            switch (tier) {
                case "DIAMOND":
                case "PLATINUM":
                    res.setPriority("URGENT");
                    break;
                case "GOLD":
                    res.setPriority("HIGH");
                    break;
                case "SILVER":
                    res.setPriority("MEDIUM");
                    break;
                default:
                    res.setPriority("LOW");
                    break;
            }
            return res;
        }).toList());

        // 3. THUẬT TOÁN SẮP XẾP CHUYÊN NGHIỆP
        responseList.sort((r1, r2) -> {
            int unreadCompare = Boolean.compare(r2.getUnreadCount() > 0, r1.getUnreadCount() > 0);
            if (unreadCompare != 0) return unreadCompare;

            int priorityCompare = Integer.compare(getPriorityWeight(r2.getPriority()), getPriorityWeight(r1.getPriority()));
            if (priorityCompare != 0) return priorityCompare;

            return r2.getUpdatedAt().compareTo(r1.getUpdatedAt());
        });

        return responseList;
    }

    @Override
    @Transactional
    public void markAsSeen(String roomId, String userId) {
        // 👉 ĐÃ SỬA: Truyền thêm MessageStatus.SEEN vào tham số thứ 3
        int updatedCount = messageRepository.markMessagesAsSeen(roomId, userId, MessageStatus.SEEN);

        if (updatedCount > 0) {
            chatRoomRepository.findById(roomId).ifPresent(room -> {
                String senderId = room.getUserId().equals(userId) ?
                        (room.getAdminId() != null ? room.getAdminId() : SYSTEM_ADMIN_ID) :
                        room.getUserId();

                messagingTemplate.convertAndSend("/topic/messages." + senderId + ".seen", roomId);
            });
        }
    }

    @Override
    @Transactional
    public void updateRoomStatus(String roomId, RoomStatus status) {
        // 1. Tìm phòng chat
        ChatRoomEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND)); // Hoặc dùng Exception tùy ý dự án bạn

        // 2. Cập nhật trạng thái
        room.setStatus(status);
        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        // 3. 👉 ĐỈNH CAO UI/UX: Bắn tín hiệu WebSocket cho Khách hàng
        // Nếu Admin đổi trạng thái, bắn tín hiệu để Frontend Khách hàng tự khóa thanh chat lại
        messagingTemplate.convertAndSend(
                "/topic/messages." + room.getUserId() + ".status",
                status.name()
        );

        // (Tùy chọn) Bắn thêm cho Admin để List danh sách bên tay trái cũng cập nhật realtime nếu cần
        if (room.getAdminId() != null) {
            messagingTemplate.convertAndSend("/topic/messages." + room.getAdminId() + ".status", status.name());
        }
    }

    private int getPriorityWeight(String priority) {
        return switch (priority) {
            case "URGENT" -> 4;
            case "HIGH" -> 3;
            case "MEDIUM" -> 2;
            default -> 1; // LOW
        };
    }
}