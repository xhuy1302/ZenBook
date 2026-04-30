package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.order.OrderStatusUpdateRequest;
import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    /**
     * CLIENT: Đặt hàng mới
     * (Tự động gửi mail Xác nhận đơn hàng bên trong Service nếu là COD)
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        String email = getUsername();

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Gọi service xử lý logic và gửi mail
        OrderResponse response = orderService.createOrder(request, email, getRole(), user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ADMIN/USER: Chỉnh sửa thông tin đơn hàng (Khi còn PENDING)
     */
    // 👇 SỬA Ở ĐÂY: Đổi {id} thành {idOrCode}
    @PutMapping("/{idOrCode}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable String idOrCode,
            @Valid @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(idOrCode, request, getUsername(), getRole()));
    }

    /**
     * ADMIN: Cập nhật trạng thái đơn hàng (Xác nhận, Giao hàng, v.v.)
     * (Tự động gửi mail Thông báo trạng thái mới bên trong Service)
     */
    // 👇 SỬA Ở ĐÂY: Đổi {id} thành {idOrCode}
    @PatchMapping("/{idOrCode}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable String idOrCode,
            @Valid @RequestBody OrderStatusUpdateRequest request) {

        // request.getNote() sẽ được truyền vào mail nếu bạn muốn hiển thị lý do/ghi chú
        OrderResponse response = orderService.updateOrderStatus(
                idOrCode,
                request.getNewStatus(),
                request.getNote(),
                getUsername(),
                getRole()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * ADMIN: Lấy tất cả đơn hàng (Phân trang, Lọc theo trạng thái, Ngày tháng)
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getAllOrders(status, startDate, endDate, pageable));
    }

    /**
     * CLIENT: Lấy lịch sử đơn hàng của tôi
     */
    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderResponse>> getMy(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {

        String email = getUsername();
        if (email == null) throw new AppException(ErrorCode.UNAUTHENTICATED);

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getMyOrders(user.getId(), status, pageable));
    }

    /**
     * CHUNG: Lấy chi tiết 1 đơn hàng
     */
    // 👇 SỬA Ở ĐÂY: Đổi {id} thành {idOrCode}
    @GetMapping("/{idOrCode}")
    public ResponseEntity<OrderResponse> getOne(@PathVariable String idOrCode) {
        return ResponseEntity.ok(orderService.getOrderById(idOrCode));
    }

    /**
     * ADMIN: Đếm số đơn hàng đang chờ (Badge thông báo)
     */
    @GetMapping("/count-pending")
    public ResponseEntity<Long> getCountPending() {
        return ResponseEntity.ok(orderService.countPendingOrders());
    }

    // --- HELPER METHODS ---

    private String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()))
                ? auth.getName() : null;
    }

    private ActionRole getRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return ActionRole.USER;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) return ActionRole.ADMIN;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"))) return ActionRole.STAFF;
        return ActionRole.USER;
    }
}