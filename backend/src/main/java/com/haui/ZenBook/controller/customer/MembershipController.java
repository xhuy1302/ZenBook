package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.membership.MemberInfoResponse;
import com.haui.ZenBook.dto.membership.PointHistoryResponse;
import com.haui.ZenBook.entity.UserEntity; // 👉 Thêm import này
import com.haui.ZenBook.enums.PointTransactionType;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.repository.PointHistoryRepository;
import com.haui.ZenBook.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;
    private final PointHistoryRepository pointHistoryRepository;

    // Hàm dùng chung để lấy đúng UUID của User từ Token
    private String getUserIdFromToken(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return user.getId();
    }

    // 1. Lấy thông tin thẻ thành viên
    @GetMapping("/me")
    public ResponseEntity<MemberInfoResponse> getMyMembership(Authentication authentication) {
        String userId = getUserIdFromToken(authentication); // 👉 Sửa ở đây
        return ResponseEntity.ok(membershipService.getMemberInfo(userId));
    }

    // 2. Lấy lịch sử giao dịch điểm
    @GetMapping("/me/histories")
    public ResponseEntity<List<PointHistoryResponse>> getMyPointHistories(Authentication authentication) {
        String userId = getUserIdFromToken(authentication); // 👉 Sửa ở đây
        return ResponseEntity.ok(membershipService.getPointHistories(userId));
    }

    // 3. Đổi điểm lấy mã giảm giá
    @PostMapping("/exchange")
    public ResponseEntity<String> exchangePointsForVoucher(
            Authentication authentication,
            @RequestParam String packageCode) {

        String userId = getUserIdFromToken(authentication); // 👉 Sửa ở đây
        membershipService.exchangeVoucher(userId, packageCode);

        return ResponseEntity.ok("Đổi điểm thành công! Mã giảm giá đã được thêm vào ví của bạn.");
    }

    @PostMapping("/check-in")
    public ResponseEntity<String> dailyCheckIn(Authentication authentication) {
        // Lấy UserEntity từ Token
        UserEntity user = (UserEntity) authentication.getPrincipal();

        // Gọi thẳng hàm checkIn chuẩn
        String result = membershipService.checkIn(user.getId());

        return ResponseEntity.ok(result);
    }
}