package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.membership.MemberInfoResponse;
import com.haui.ZenBook.dto.membership.PointHistoryResponse;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.MemberTier;
import com.haui.ZenBook.enums.PointTransactionType;
import com.haui.ZenBook.enums.RewardPackage;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

    private final MembershipRepository membershipRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public MembershipEntity getOrCreateMembership(String userId) {
        return membershipRepository.findByUserId(userId).orElseGet(() -> {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            MembershipEntity newMembership = MembershipEntity.builder()
                    .user(user)
                    .tier(MemberTier.MEMBER)
                    .availablePoints(0)
                    .totalSpending(0.0)
                    .build();
            return membershipRepository.save(newMembership);
        });
    }

    @Override
    @Transactional
    public void processOrderCompletion(OrderEntity order) {
        MembershipEntity membership = getOrCreateMembership(order.getUserId());
        membership.setTotalSpending(membership.getTotalSpending() + order.getFinalTotal());

        MemberTier currentTier = membership.getTier();
        MemberTier newTier = calculateTier(membership.getTotalSpending());

        if (newTier.ordinal() > currentTier.ordinal()) {
            membership.setTier(newTier);
            notificationService.createNotification(
                    order.getUserId(), "MEMBERSHIP", "🎉 Thăng hạng thành viên!",
                    "Chúc mừng! Bạn đã thăng hạng lên " + newTier.getDisplayName(), "/customer/membership"
            );
        }

        int basePoints = (int) (order.getFinalTotal() / 1000);
        int earnedPoints = (int) (basePoints * newTier.getPointMultiplier());

        if (earnedPoints > 0) {
            membership.setAvailablePoints(membership.getAvailablePoints() + earnedPoints);
            pointHistoryRepository.save(PointHistoryEntity.builder()
                    .user(membership.getUser())
                    .type(PointTransactionType.EARN)
                    .points(earnedPoints)
                    .description("Tích điểm từ đơn hàng " + order.getOrderCode())
                    .referenceId(order.getOrderCode())
                    .streak(0)
                    .build());
        }
        membershipRepository.save(membership);
    }

    @Override
    @Transactional
    public void processOrderRefund(OrderEntity order) {
        MembershipEntity membership = getOrCreateMembership(order.getUserId());
        membership.setTotalSpending(Math.max(0, membership.getTotalSpending() - order.getFinalTotal()));
        membership.setTier(calculateTier(membership.getTotalSpending()));

        int basePoints = (int) (order.getFinalTotal() / 1000);
        int deductedPoints = (int) (basePoints * membership.getTier().getPointMultiplier());

        if (deductedPoints > 0) {
            membership.setAvailablePoints(Math.max(0, membership.getAvailablePoints() - deductedPoints));
            pointHistoryRepository.save(PointHistoryEntity.builder()
                    .user(membership.getUser())
                    .type(PointTransactionType.REFUND)
                    .points(-deductedPoints)
                    .description("Hoàn trả điểm đơn " + order.getOrderCode())
                    .referenceId(order.getOrderCode())
                    .build());
        }
        membershipRepository.save(membership);
    }

    @Override
    @Transactional
    public void addBonusPoints(String userId, int basePoints, String description, String referenceId) {
        MembershipEntity membership = getOrCreateMembership(userId);
        int finalPoints = basePoints;

        if (membership.getUser().getDateOfBirth() != null) {
            LocalDate today = LocalDate.now();
            if (today.getMonth() == membership.getUser().getDateOfBirth().getMonth() &&
                    today.getDayOfMonth() == membership.getUser().getDateOfBirth().getDayOfMonth()) {
                finalPoints *= 2;
            }
        }

        membership.setAvailablePoints(membership.getAvailablePoints() + finalPoints);
        membershipRepository.save(membership);

        pointHistoryRepository.save(PointHistoryEntity.builder()
                .user(membership.getUser()).type(PointTransactionType.BONUS)
                .points(finalPoints).description(description).referenceId(referenceId).build());
    }

    @Transactional
    @Override
    public String checkIn(String userId) {
        // Dùng định dạng yyyy-MM-dd cố định
        String todayRef = "CHECKIN_" + LocalDate.now().toString();
        String yesterdayRef = "CHECKIN_" + LocalDate.now().minusDays(1).toString();

        if (pointHistoryRepository.existsByUserIdAndTypeAndReferenceId(userId, PointTransactionType.BONUS, todayRef)) {
            throw new AppException(ErrorCode.ALREADY_CHECKED_IN);
        }

        // Tìm streak ngày hôm qua
        int currentStreak = pointHistoryRepository.findByUserIdAndTypeAndReferenceId(userId, PointTransactionType.BONUS, yesterdayRef)
                .map(PointHistoryEntity::getStreak).orElse(0) + 1;

        int bonusPoints = (currentStreak % 3 == 0) ? 15 : 5;

        MembershipEntity membership = getOrCreateMembership(userId);
        pointHistoryRepository.save(PointHistoryEntity.builder()
                .user(membership.getUser()).type(PointTransactionType.BONUS)
                .points(bonusPoints).description("Điểm danh chuỗi " + currentStreak + " ngày")
                .referenceId(todayRef).streak(currentStreak).build());

        membership.setAvailablePoints(membership.getAvailablePoints() + bonusPoints);
        membershipRepository.save(membership);

        notificationService.createNotification(userId, "MEMBERSHIP", "🔥 Điểm danh thành công!",
                "Chuỗi " + currentStreak + " ngày. Bạn nhận được +" + bonusPoints + " ZPoints.", "/customer/membership");

        return "Chuỗi " + currentStreak + " ngày! +" + bonusPoints + " ZPoints.";
    }

    @Override
    public MemberInfoResponse getMemberInfo(String userId) {
        MembershipEntity membership = getOrCreateMembership(userId);
        String todayRef = "CHECKIN_" + LocalDate.now().toString();
        String yesterdayRef = "CHECKIN_" + LocalDate.now().minusDays(1).toString();

        boolean isToday = pointHistoryRepository.existsByUserIdAndTypeAndReferenceId(userId, PointTransactionType.BONUS, todayRef);

        int streak = isToday
                ? pointHistoryRepository.findByUserIdAndTypeAndReferenceId(userId, PointTransactionType.BONUS, todayRef).map(PointHistoryEntity::getStreak).orElse(1)
                : pointHistoryRepository.findByUserIdAndTypeAndReferenceId(userId, PointTransactionType.BONUS, yesterdayRef).map(PointHistoryEntity::getStreak).orElse(0);

        return MemberInfoResponse.builder()
                .name(membership.getUser().getFullName() != null ? membership.getUser().getFullName() : membership.getUser().getUsername())
                .memberId("ZB-" + membership.getUser().getId().substring(0, 8).toUpperCase())
                .points(membership.getAvailablePoints())
                .tier(membership.getTier().name().toLowerCase())
                .totalSpending(membership.getTotalSpending())
                .currentStreak(streak)
                .isCheckedInToday(isToday) // Trả về true/false xịn để Frontend thắp lửa
                .build();
    }

    @Override
    public List<PointHistoryResponse> getPointHistories(String userId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return pointHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(h -> PointHistoryResponse.builder()
                        .id(h.getId()).title(h.getDescription())
                        .date(h.getCreatedAt().format(formatter))
                        .points(h.getPoints()).type(h.getType().name().toLowerCase()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void exchangeVoucher(String userId, String packageCode) {
        MembershipEntity membership = getOrCreateMembership(userId);
        RewardPackage reward = RewardPackage.fromString(packageCode);
        if (reward == null) throw new AppException(ErrorCode.INVALID_DATA, "Gói quà không tồn tại.");
        if (membership.getAvailablePoints() < reward.getRequiredPoints()) throw new AppException(ErrorCode.INVALID_ACTION, "Không đủ điểm.");

        membership.setAvailablePoints(membership.getAvailablePoints() - reward.getRequiredPoints());
        membershipRepository.save(membership);

        pointHistoryRepository.save(PointHistoryEntity.builder()
                .user(membership.getUser()).type(PointTransactionType.REDEEM)
                .points(-reward.getRequiredPoints()).description("Đổi quà: " + reward.getDescription())
                .referenceId("REWARD_" + packageCode).build());

        String uniqueCode = "REWARD-" + packageCode.split("_")[1] + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        couponRepository.save(CouponEntity.builder()
                .code(uniqueCode).discountType(reward.getDiscountType()).discountValue(reward.getDiscountValue())
                .couponType(reward.getCouponType()).minOrderValue(0.0).maxDiscountAmount(reward.getDiscountValue())
                .startDate(LocalDateTime.now()).endDate(LocalDateTime.now().plusDays(30)).usageLimit(1)
                .usedCount(0).maxUsagePerUser(1).status(com.haui.ZenBook.enums.CouponStatus.ACTIVE).userId(userId).build());

        notificationService.createNotification(userId, "PROMOTION", "🎁 Đổi quà thành công!", "Mã " + uniqueCode + " đã được thêm vào ví của bạn.", "/customer/vouchers");
    }

    private MemberTier calculateTier(Double spending) {
        if (spending >= MemberTier.DIAMOND.getMinSpending()) return MemberTier.DIAMOND;
        if (spending >= MemberTier.PLATINUM.getMinSpending()) return MemberTier.PLATINUM;
        if (spending >= MemberTier.GOLD.getMinSpending()) return MemberTier.GOLD;
        if (spending >= MemberTier.SILVER.getMinSpending()) return MemberTier.SILVER;
        return MemberTier.MEMBER;
    }
}