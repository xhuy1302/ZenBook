package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.MessageEntity;
import com.haui.ZenBook.enums.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, String> {

    Page<MessageEntity> findByRoomIdOrderByCreatedAtDesc(String roomId, Pageable pageable);

    // 👉 1. Đếm số tin nhắn chưa đọc của một người trong 1 phòng
    long countByRoomIdAndReceiverIdAndStatus(String roomId, String receiverId, MessageStatus status);

    @Modifying
    @Query("UPDATE MessageEntity m SET m.status = :seenStatus WHERE m.roomId = :roomId AND m.receiverId = :receiverId AND m.status != :seenStatus")
    int markMessagesAsSeen(
            @Param("roomId") String roomId,
            @Param("receiverId") String receiverId,
            @Param("seenStatus") MessageStatus seenStatus // Truyền Enum thay vì gõ cứng String
    );
}