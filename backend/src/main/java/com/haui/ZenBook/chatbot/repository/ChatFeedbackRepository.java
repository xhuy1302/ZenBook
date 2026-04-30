package com.haui.ZenBook.chatbot.repository;

import com.haui.ZenBook.chatbot.entity.ChatFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatFeedbackRepository extends JpaRepository<ChatFeedback, Long> {
}