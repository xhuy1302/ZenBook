package com.haui.ZenBook.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 👉 Đây là dòng cực kỳ quan trọng để tạo ra SimpMessagingTemplate
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Kích hoạt bưu cục để gửi tin nhắn đến các địa chỉ bắt đầu bằng /queue (1-1) hoặc /topic (1-n)
        registry.enableSimpleBroker("/queue", "/topic");

        // Các tin nhắn từ Client gửi lên Server phải có tiền tố /app
        registry.setApplicationDestinationPrefixes("/app");

        // Cấu hình tiền tố cho tin nhắn gửi đích danh cá nhân (User Destination)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký cổng kết nối WebSocket (Handshake)
        // Lưu ý: Đặt tên là /ws-support để khớp với SecurityConfig đã sửa ở bước trước
        registry.addEndpoint("/ws-support")
                .setAllowedOriginPatterns("*") // Cho phép mọi nguồn (CORS) để tiện test
                .withSockJS(); // Hỗ trợ fallback cho các trình duyệt cũ
    }
}