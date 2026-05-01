package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, String> {
    Optional<ChatRoomEntity> findByUserId(String userId);
    List<ChatRoomEntity> findAllByOrderByUpdatedAtDesc();
    List<ChatRoomEntity> findByAdminIdOrderByUpdatedAtDesc(String adminId);
}