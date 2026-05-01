package com.haui.ZenBook.controller;

import com.haui.ZenBook.dto.chat.ChatMessageRequest;
import com.haui.ZenBook.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final ChatService chatService;

    @MessageMapping("/support.sendMessage")
    public void receiveMessage(@Payload ChatMessageRequest request) {
        log.info("Tin nhắn WebSocket từ: {}", request.getSenderId());
        chatService.processMessage(request, request.isAdmin());
    }
}