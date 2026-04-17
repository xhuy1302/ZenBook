package com.haui.ZenBook.schedule;

import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    // Chạy ngầm 30 phút/lần
    @Scheduled(cron = "0 0/30 * * * *")
    public void autoCancelGhostOrders() {
        log.info("Bot dọn dẹp: Bắt đầu quét đơn hàng PENDING quá hạn...");

        // Tìm các đơn chưa duyệt tạo cách đây hơn 24 giờ
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        List<OrderEntity> ghostOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoffTime);

        int count = 0;
        for (OrderEntity order : ghostOrders) {
            try {
                // Tự động Hủy và Hoàn kho
                orderService.updateOrderStatus(
                        order.getId(),
                        OrderStatus.CANCELLED,
                        "Hệ thống tự động hủy đơn do quá hạn xác nhận/thanh toán",
                        "SYSTEM_BOT",
                        ActionRole.SYSTEM
                );
                count++;
            } catch (Exception e) {
                log.error("Lỗi khi auto-cancel đơn hàng {}: {}", order.getOrderCode(), e.getMessage());
            }
        }

        if (count > 0) {
            log.info("Bot dọn dẹp: Đã hủy và hoàn kho thành công {} đơn hàng.", count);
        }
    }
}