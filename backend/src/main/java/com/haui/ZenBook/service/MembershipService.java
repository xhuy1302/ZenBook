package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.membership.MemberInfoResponse;
import com.haui.ZenBook.dto.membership.PointHistoryResponse;
import com.haui.ZenBook.entity.MembershipEntity;
import com.haui.ZenBook.entity.OrderEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MembershipService {

    // Khởi tạo hoặc lấy hồ sơ thành viên
    MembershipEntity getOrCreateMembership(String userId);

    // Nghiệp vụ xử lý đơn hàng
    void processOrderCompletion(OrderEntity order);
    void processOrderRefund(OrderEntity order);

    // 👉 HÀM CHECK-IN ĐÃ ĐƯỢC CHUẨN HOÁ LOGIC CỘNG ĐIỂM
    // Nhớ khai báo hàm này trong MembershipService (Interface) nhé
    @Transactional
    String checkIn(String userId);

    // API phục vụ cho Frontend hiển thị
    MemberInfoResponse getMemberInfo(String userId);
    List<PointHistoryResponse> getPointHistories(String userId);

    // Đổi điểm lấy mã giảm giá
    void exchangeVoucher(String userId, String voucherId);

    // Trạm cộng điểm vạn năng (Đánh giá, Check-in, Sự kiện)
    void addBonusPoints(String userId, int basePoints, String description, String referenceId);
}