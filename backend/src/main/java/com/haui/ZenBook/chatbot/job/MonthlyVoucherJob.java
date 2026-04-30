package com.haui.ZenBook.chatbot.job;

import com.haui.ZenBook.dto.coupon.CouponRequest;
import com.haui.ZenBook.entity.MembershipEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.enums.DiscountType;
import com.haui.ZenBook.enums.MemberTier;
import com.haui.ZenBook.repository.MembershipRepository;
import com.haui.ZenBook.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class MonthlyVoucherJob {

    private final MembershipRepository membershipRepository;
    private final CouponService couponService;

    // 👉 Chạy vào lúc 00:00:00 ngày 1 hàng tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    // @Scheduled(cron = "0 * * * * ?") // Dùng dòng này nếu muốn test chạy mỗi phút
    @Transactional
    public void distributeMonthlyVouchers() {
        log.info("Bắt đầu Job phân phát Voucher tháng cho Thành Viên VIP...");

        // 1. Tìm tất cả user từ hạng VÀNG (Gold) trở lên
        List<MembershipEntity> vipMembers = membershipRepository.findAll().stream()
                .filter(m -> m.getTier() == MemberTier.GOLD ||
                        m.getTier() == MemberTier.PLATINUM ||
                        m.getTier() == MemberTier.DIAMOND)
                .toList();

        LocalDate today = LocalDate.now();
        String currentMonthYear = today.getMonthValue() + "" + today.getYear(); // Vd: 42026

        int count = 0;

        for (MembershipEntity membership : vipMembers) {
            UserEntity user = membership.getUser();
            try {
                // 2. Tạo mã Voucher Tháng 10% (Chỉ dành cho Gold, vì Platinum/Diamond có thẻ Freeship)
                if (membership.getTier() == MemberTier.GOLD) {
                    // Cấu trúc mã: MONTHLY-42026-HUY (Để nó đẹp và ngắn)
                    String shortName = user.getUsername().length() > 5
                            ? user.getUsername().substring(0, 5).toUpperCase()
                            : user.getUsername().toUpperCase();
                    String voucherCode = "MONTHLY-" + currentMonthYear + "-" + shortName;

                    CouponRequest request = new CouponRequest();
                    request.setCode(voucherCode);
                    request.setCouponType(CouponType.ORDER);
                    request.setDiscountType(DiscountType.PERCENTAGE);
                    request.setDiscountValue(10.0); // Giảm 10%
                    request.setMaxDiscountAmount(50000.0); // Giảm tối đa 50k
                    request.setMinOrderValue(150000.0); // Đơn từ 150k
                    request.setMaxUsagePerUser(1);
                    request.setUserId(user.getId()); // Gán cho đúng user này
                    request.setStartDate(LocalDateTime.now());
                    request.setEndDate(LocalDateTime.now().plusMonths(1)); // Hạn 1 tháng
                    request.setStatus(CouponStatus.ACTIVE);

                    couponService.createCoupon(request);
                    count++;
                }

                // Lưu ý: Hạng Platinum và Diamond không cần phát mã Freeship hàng tháng
                // Vì ở file OrderServiceImpl phía trên, họ đã được code "Freeship Unlimited" ẩn bên trong rồi.

            } catch (Exception e) {
                log.error("Lỗi khi phát voucher tháng cho user {}: {}", user.getUsername(), e.getMessage());
            }
        }

        log.info("Job phân phát Voucher tháng hoàn tất. Đã gửi quà cho {} VIP.", count);
    }
}