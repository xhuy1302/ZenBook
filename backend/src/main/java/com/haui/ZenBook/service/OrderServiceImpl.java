package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderItemRequest;
import com.haui.ZenBook.dto.order.OrderResponse;

import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.OrderDetailEntity;
import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.entity.OrderHistoryEntity;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.BookStatus;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.enums.PaymentStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.OrderMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, String actionBy, ActionRole role, String userId) {
        OrderEntity newOrder = OrderEntity.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .shippingFee(30000.0)
                .discountAmount(0.0)
                .build();

        processOrderItems(newOrder, request.getItems());

        recordHistory(newOrder, null, OrderStatus.PENDING, actionBy, role, "Tạo đơn hàng mới");
        return orderMapper.toOrderResponse(orderRepository.save(newOrder));
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(String orderId, OrderUpdateRequest request, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_UPDATE);
        }

        // 1. Hoàn trả kho cho các món cũ trước khi xóa
        for (OrderDetailEntity detail : order.getDetails()) {
            BookEntity book = detail.getBook();
            book.setStockQuantity(book.getStockQuantity() + detail.getQuantity());
            bookRepository.save(book);
        }
        order.getDetails().clear(); // Hibernate orphanRemoval sẽ lo phần này

        // 2. Cập nhật thông tin cơ bản
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());

        // 3. Xử lý lại giỏ hàng mới
        processOrderItems(order, request.getItems());

        recordHistory(order, OrderStatus.PENDING, OrderStatus.PENDING, actionBy, role, "Chỉnh sửa thông tin và giỏ hàng");
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus, String note, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderStatus oldStatus = order.getStatus();

        if (oldStatus == newStatus || oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.COMPLETED || oldStatus == OrderStatus.RETURNED) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        // State Machine Check
        boolean valid = switch (oldStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PACKING;
            case PACKING -> newStatus == OrderStatus.SHIPPING;
            case SHIPPING -> newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.RETURNED;
            default -> false;
        };
        if (!valid) throw new AppException(ErrorCode.ORDER_STATUS_INVALID);

        // Hoàn kho nếu Hủy/Trả hàng
        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.RETURNED) {
            for (OrderDetailEntity detail : order.getDetails()) {
                BookEntity b = detail.getBook();
                b.setStockQuantity(b.getStockQuantity() + detail.getQuantity());
                bookRepository.save(b);
            }
        }

        order.setStatus(newStatus);
        recordHistory(order, oldStatus, newStatus, actionBy, role, note);
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    // Hàm dùng chung để xử lý giỏ hàng và trừ kho
    private void processOrderItems(OrderEntity order, List<OrderItemRequest> items) {
        double totalItemsPrice = 0.0;
        if (order.getDetails() == null) order.setDetails(new ArrayList<>());

        for (OrderItemRequest itemReq : items) {
            BookEntity book = bookRepository.findById(itemReq.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND, itemReq.getBookId()));

            if (book.getDeletedAt() != null || !BookStatus.ACTIVE.equals(book.getStatus()))
                throw new AppException(ErrorCode.BOOK_NOT_ACTIVE, book.getTitle());

            if (book.getStockQuantity() < itemReq.getQuantity())
                throw new AppException(ErrorCode.BOOK_STOCK_INVALID, book.getTitle(), book.getStockQuantity(), itemReq.getQuantity());

            book.setStockQuantity(book.getStockQuantity() - itemReq.getQuantity());
            bookRepository.save(book);

            double subTotal = itemReq.getQuantity() * book.getSalePrice();
            totalItemsPrice += subTotal;

            order.getDetails().add(OrderDetailEntity.builder()
                    .order(order).book(book).quantity(itemReq.getQuantity())
                    .priceAtPurchase(book.getSalePrice()).subTotal(subTotal).build());
        }
        order.setTotalItemsPrice(totalItemsPrice);
        order.setFinalTotal(totalItemsPrice + order.getShippingFee() - order.getDiscountAmount());
    }

    private void recordHistory(OrderEntity order, OrderStatus from, OrderStatus to, String by, ActionRole role, String note) {
        if (order.getHistories() == null) order.setHistories(new ArrayList<>());
        order.getHistories().add(OrderHistoryEntity.builder()
                .order(order).fromStatus(from).toStatus(to)
                .actionBy(by).role(role).note(note).build());
    }

    @Override public Page<OrderResponse> getAllOrders(OrderStatus s, Pageable p) {
        return ((s != null) ? orderRepository.findByStatus(s, p) : orderRepository.findAllByOrderByCreatedAtDesc(p)).map(orderMapper::toOrderResponse);
    }

    @Override public Page<OrderResponse> getMyOrders(String u, Pageable p) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(u, p).map(orderMapper::toOrderResponse);
    }

    @Override public OrderResponse getOrderById(String id) {
        return orderRepository.findById(id).map(orderMapper::toOrderResponse).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Override
    public long countPendingOrders() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }

    private String generateOrderCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        String prefix = "ZB-" + date;
        String max = orderRepository.findMaxOrderCodeByDate(prefix);
        int next = (max == null) ? 1 : Integer.parseInt(max.substring(max.lastIndexOf("-") + 1)) + 1;
        return String.format("%s-%03d", prefix, next);
    }
}