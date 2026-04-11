package com.haui.ZenBook.controller.admin;

import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.order.OrderStatusUpdateRequest;
import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, getUsername(), getRole(), getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable String id, @Valid @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request, getUsername(), getRole()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable String id, @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getNewStatus(), request.getNote(), getUsername(), getRole()));
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAll(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getAllOrders(status, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<Page<OrderResponse>> getMy(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
        if (getUsername() == null) throw new AppException(ErrorCode.UNAUTHENTICATED);
        return ResponseEntity.ok(orderService.getMyOrders(getUsername(), PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOne(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    private String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) ? auth.getName() : null;
    }

    private ActionRole getRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return ActionRole.USER;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) return ActionRole.ADMIN;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"))) return ActionRole.STAFF;
        return ActionRole.USER;
    }

    @GetMapping("/count-pending")
    public ResponseEntity<Long> getCountPending() {
        return ResponseEntity.ok(orderService.countPendingOrders());
    }
}