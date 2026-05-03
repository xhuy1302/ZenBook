package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.enums.OrderStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Gửi email chứa mã OTP xác thực đăng nhập
     */
    @Async
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Mã xác nhận đăng nhập ZenBook");

            // Dùng HTML text đơn giản để không cần tạo thêm file template
            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px;'>"
                    + "<h2>Xác thực đăng nhập ZenBook</h2>"
                    + "<p>Xin chào,</p>"
                    + "<p>Mã OTP đăng nhập của bạn là: <strong style='font-size: 24px; color: #4CAF50;'>" + otpCode + "</strong></p>"
                    + "<p>Mã này sẽ hết hạn trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email chứa mã OTP đã được gửi tới {}", toEmail);

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email OTP cho {}", toEmail, e);
        }
    }

    /**
     * Gửi email thông báo khi trạng thái đơn hàng thay đổi
     */
    @Async
    public void sendOrderStatusEmail(OrderResponse order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isEmpty()) {
            log.warn("Không thể gửi email cập nhật trạng thái: Đơn hàng {} không có email khách hàng.", order.getOrderCode());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Cập nhật trạng thái đơn hàng #" + order.getOrderCode() + " - ZenBook");

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("statusVn", getStatusVn(order.getStatus()));

            String htmlContent = templateEngine.process("email/order-status", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email cập nhật trạng thái đơn hàng {} đã được gửi tới {}", order.getOrderCode(), order.getCustomerEmail());

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email cập nhật trạng thái cho {}", order.getCustomerEmail(), e);
        }
    }

    /**
     * Gửi email xác nhận đặt hàng thành công
     */
    @Async
    public void sendOrderConfirmationEmail(OrderResponse order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isEmpty()) {
            log.warn("Không thể gửi email xác nhận: Đơn hàng {} không có email khách hàng.", order.getOrderCode());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Xác nhận đơn đặt hàng #" + order.getOrderCode() + " thành công - ZenBook");

            Context context = new Context();
            context.setVariable("order", order);
            // Có thể thêm các biến khác nếu template confirmation cần

            String htmlContent = templateEngine.process("email/order-confirmation", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email XÁC NHẬN ĐƠN HÀNG {} đã được gửi tới {}", order.getOrderCode(), order.getCustomerEmail());

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email xác nhận đơn hàng cho {}", order.getCustomerEmail(), e);
        }
    }

    /**
     * Hỗ trợ dịch trạng thái đơn hàng sang Tiếng Việt hiển thị trên Email
     */
    private String getStatusVn(OrderStatus status) {
        if (status == null) return "Đang xử lý";

        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case PACKING -> "Đang đóng gói";
            case SHIPPING -> "Đang giao hàng";
            case COMPLETED -> "Giao hàng thành công";
            case RETURNED -> "Đã hoàn trả";
            case CANCELLED -> "Đã hủy";
            default -> "Đang xử lý";
        };
    }
}