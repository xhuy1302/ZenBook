package com.haui.ZenBook.chatbot.job;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.entity.MembershipEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.MemberTier;
import com.haui.ZenBook.repository.CouponRepository;
import com.haui.ZenBook.repository.MembershipRepository;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.service.CouponService;
import com.haui.ZenBook.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BirthdayVoucherJob {

    private final UserRepository userRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final JavaMailSender mailSender;

    // 👉 Tích hợp Membership & Notification
    private final MembershipRepository membershipRepository;
    private final NotificationService notificationService;

    // Chạy lúc 8h sáng mỗi ngày.
    // (Nếu muốn test chạy liên tục mỗi 10 giây thì dùng: @Scheduled(cron = "*/10 * * * * ?"))
    @Scheduled(cron = "10 * * * * ?")
    @Transactional
    public void scanAndGiftBirthdayVouchers() {
        LocalDate today = LocalDate.now();
        int currentYearShort = today.getYear() % 100; // VD năm 2026 -> 26

        List<UserEntity> users = userRepository.findAllByBirthdayMonthAndDay(today.getMonthValue(), today.getDayOfMonth());

        for (UserEntity user : users) {
            try {
                // 1. Kiểm tra năm nay đã tặng mã chưa (Pattern: BDAY26-%)
                String pattern = "BDAY" + currentYearShort + "-%";

                if (couponRepository.existsByUserIdAndCodeLike(user.getId(), pattern)) {
                    continue; // Đã tặng rồi thì bỏ qua
                }

                // 2. Lấy thông tin Hạng thành viên để phân quà
                MembershipEntity membership = membershipRepository.findByUserId(user.getId()).orElse(null);
                MemberTier tier = membership != null ? membership.getTier() : MemberTier.MEMBER;

                double discountPercent = 5.0; // Đồng, Bạc: 5%
                double maxDiscountAmount = 50000.0;
                boolean hasBoxQua = false;

                if (tier == MemberTier.GOLD) {
                    discountPercent = 10.0;
                    maxDiscountAmount = 100000.0;
                } else if (tier == MemberTier.PLATINUM || tier == MemberTier.DIAMOND) {
                    discountPercent = 20.0;
                    maxDiscountAmount = 200000.0;
                    hasBoxQua = true; // Bạch Kim, Kim Cương: Thêm quà vật lý
                }

                // 3. Xử lý tên để tạo mã ngắn gọn (chống lỗi nếu username là email)
                String rawName = user.getUsername() != null ? user.getUsername() : "";

                // Nếu là email, chỉ lấy phần chữ đằng trước dấu @
                if (rawName.contains("@")) {
                    rawName = rawName.split("@")[0];
                }

                // Lọc bỏ hết khoảng trắng và ký tự đặc biệt, chỉ giữ lại chữ cái và số
                rawName = rawName.replaceAll("[^a-zA-Z0-9]", "").toUpperCase();

                // Lấy tối đa 5 ký tự đầu tiên
                String shortName = rawName.length() > 5
                        ? rawName.substring(0, 5)
                        : rawName;

                // Mã sinh ra sẽ cực chuẩn, ví dụ: BDAY26-VUXUA-A1B2 (Luôn < 20 ký tự)
                String voucherCode = "BDAY" + currentYearShort + "-" + shortName + "-" + user.getId().substring(0, 4).toUpperCase();

                // 4. Tạo Coupon
                CouponRequest request = new CouponRequest();
                request.setCode(voucherCode);
                request.setCouponType(CouponType.ORDER);
                request.setDiscountType(DiscountType.PERCENTAGE);
                request.setDiscountValue(discountPercent);
                request.setMaxDiscountAmount(maxDiscountAmount);
                request.setMinOrderValue(0.0); // Không yêu cầu đơn tối thiểu

                // 👉 SỬA LỖI ĐÂY: Thêm giới hạn TỔNG lượt sử dụng là 1
                request.setUsageLimit(1);

                request.setMaxUsagePerUser(1);
                request.setUserId(user.getId());
                request.setStartDate(LocalDateTime.now());
                request.setEndDate(LocalDateTime.now().plusDays(30));
                request.setStatus(CouponStatus.ACTIVE);

                couponService.createCoupon(request);

                // 5. Bắn thông báo In-app Notification
                String notiContent = "ZenBook tặng bạn mã " + voucherCode + " giảm " + (int)discountPercent + "% (Tối đa " + (int)(maxDiscountAmount/1000) + "k). Chúc bạn tuổi mới rạng rỡ!";
                if (hasBoxQua) {
                    notiContent += " 🎁 Đặc biệt, một Box Quà Sinh Nhật giới hạn đang chờ bạn, hãy liên hệ bộ phận CSKH để nhận nhé!";
                }
                notificationService.createNotification(
                        user.getId(),
                        "PROMOTION",
                        "🎂 Quà tặng Sinh Nhật!",
                        notiContent,
                        "/cart" // Click vào thông báo sẽ dẫn đến giỏ hàng
                );

                // 6. Gửi Email chúc mừng
                sendBirthdayEmail(user.getEmail(), user.getUsername(), voucherCode, discountPercent, hasBoxQua);

            } catch (Exception e) {
                log.error("Lỗi tặng quà sinh nhật cho user {}: {}", user.getUsername(), e.getMessage());
            }
        }
    }

    private void sendBirthdayEmail(String to, String name, String code, double discountPercent, boolean hasBoxQua) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("🎉 Chúc mừng sinh nhật " + name + " - ZenBook tặng bạn món quà đặc biệt!");

            String text = "Chào " + name + ",\n\n" +
                    "Chúc mừng sinh nhật bạn! ZenBook chúc bạn một tuổi mới tràn đầy niềm vui và gặt hái thêm nhiều tri thức.\n\n" +
                    "Món quà của bạn là mã giảm giá " + (int)discountPercent + "%: " + code + "\n" +
                    "Mã có hiệu lực trong 30 ngày. Hãy sử dụng ngay để rinh về những cuốn sách mình yêu thích nhé!\n\n";

            if (hasBoxQua) {
                text += "🎁 Quà tặng Đặc quyền VIP: Vì bạn là thành viên cao cấp, ZenBook đã chuẩn bị riêng 1 Box Quà Sinh Nhật vật lý. Vui lòng liên hệ Fanpage/Hotline để chúng tôi gửi quà đến tận nhà bạn nhé!\n\n";
            }

            text += "Trân trọng,\nĐội ngũ ZenBook.";

            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Không gửi được email sinh nhật cho {}: {}", to, e.getMessage());
        }
    }
}