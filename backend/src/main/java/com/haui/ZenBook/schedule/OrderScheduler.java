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

    // Chỉnh lại chạy ngầm 15 phút/lần để bắt kịp thời gian timeout của VNPAY
    // (Cron: Giây Phút Giờ Ngày Tháng Thứ)
    @Scheduled(cron = "0 0/15 * * * *")
    public void autoCancelGhostOrders() {
        log.info("Bot dọn dẹp: Bắt đầu quét đơn hàng PENDING quá hạn...");

        // 1. Định nghĩa các mốc thời gian hết hạn
        LocalDateTime vnpayCutoff = LocalDateTime.now().minusMinutes(15);
        LocalDateTime codCutoff = LocalDateTime.now().minusHours(24);

        // 2. Lấy tất cả các đơn PENDING được tạo từ 15 phút trước trở về trước
        // (Hàm này lấy lên cả đơn VNPAY treo và đơn COD, ta sẽ lọc ở dưới)
        List<OrderEntity> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, vnpayCutoff);

        int count = 0;
        for (OrderEntity order : pendingOrders) {
            try {
                // Kiểm tra xem đơn hàng này thuộc diện nào
                boolean isVnpayExpired = "VNPAY".equalsIgnoreCase(order.getPaymentMethod());
                // Đối với đơn không phải VNPAY, kiểm tra xem đã quá 24h chưa
                boolean isCodExpired = order.getCreatedAt().isBefore(codCutoff);

                // Nếu là đơn VNPAY treo > 15 phút, HOẶC đơn bình thường treo > 24h thì mới Hủy
                if (isVnpayExpired || isCodExpired) {

                    String cancelReason = isVnpayExpired
                            ? "Hệ thống tự động hủy: Khách hàng không hoàn tất thanh toán VNPAY trong 15 phút"
                            : "Hệ thống tự động hủy: Đơn hàng quá 24h không xác nhận";

                    // Tự động Hủy đơn và hàm này sẽ tự động gọi logic Hoàn kho trong OrderService
                    orderService.updateOrderStatus(
                            order.getId(),
                            OrderStatus.CANCELLED,
                            cancelReason,
                            "SYSTEM_BOT",
                            ActionRole.SYSTEM
                    );
                    count++;
                }
            } catch (Exception e) {
                log.error("Lỗi khi auto-cancel đơn hàng {}: {}", order.getOrderCode(), e.getMessage());
            }
        }

        if (count > 0) {
            log.info("Bot dọn dẹp: Đã hủy và hoàn kho thành công {} đơn hàng.", count);
        } else {
            log.info("Bot dọn dẹp: Không có đơn hàng nào cần hủy đợt này.");
        }
    }
}