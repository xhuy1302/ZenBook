package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderItemRequest;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.ActionRole;
import com.haui.ZenBook.enums.BookStatus;
import com.haui.ZenBook.enums.OrderStatus;
import com.haui.ZenBook.enums.PaymentStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.OrderMapper;
import com.haui.ZenBook.repository.AddressRepository;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.OrderRepository;
import com.haui.ZenBook.repository.ReviewRepository;
import com.haui.ZenBook.shipping.GHNShippingProvider;
import com.haui.ZenBook.shipping.ShippingCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final AddressRepository addressRepository;
    private final OrderMapper orderMapper;
    private final CartService cartService;
    private final ShippingCalculator shippingCalculator;
    private final GHNShippingProvider ghnShippingProvider;
    private final CouponService couponService;
    private final PromotionService promotionService;
    private final ReviewRepository reviewRepository;


    // 👉 INJECT EmailService
    private final EmailService emailService;

    private static final String PAYMENT_METHOD_COD = "COD";
    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, String actionBy, ActionRole role, String userId) {
        String method = request.getPaymentMethod();
        if (method == null || (!method.equalsIgnoreCase(PAYMENT_METHOD_COD) && !method.equalsIgnoreCase(PAYMENT_METHOD_VNPAY))) {
            throw new AppException(ErrorCode.INVALID_DATA, "Phương thức thanh toán không hợp lệ");
        }

        AddressEntity address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        Map<String, BookEntity> bookMap = shippingCalculator.getBooksForOrder(request.getItems());
        double rawOrderTotal = shippingCalculator.calculateOrderTotal(request.getItems(), bookMap);
        double weight = shippingCalculator.calculateTotalWeight(request.getItems(), bookMap);
        double shippingFee = ghnShippingProvider.calculateFee(address, weight, rawOrderTotal);

        double orderDiscount = 0.0;
        double shippingDiscount = 0.0;
        List<String> appliedCouponCodes = new ArrayList<>();

        List<String> categoryIdsInCart = new ArrayList<>();
        for (BookEntity book : bookMap.values()) {
            if (book.getCategories() != null) {
                book.getCategories().forEach(cat -> categoryIdsInCart.add(cat.getId()));
            }
        }

        if (request.getOrderCouponCode() != null && !request.getOrderCouponCode().isBlank()) {
            CouponResponse orderCoupon = couponService.validateCoupon(
                    request.getOrderCouponCode(), rawOrderTotal, userId, categoryIdsInCart
            );
            if (orderCoupon.getCouponType() != com.haui.ZenBook.enums.CouponType.ORDER) {
                throw new AppException(ErrorCode.COUPON_NOT_FOUND);
            }
            orderDiscount = Math.min(orderCoupon.getCalculatedDiscount(), rawOrderTotal);
            appliedCouponCodes.add(request.getOrderCouponCode());
        }

        if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().isBlank()) {
            CouponResponse shippingCoupon = couponService.validateCoupon(
                    request.getShippingCouponCode(), rawOrderTotal, userId, categoryIdsInCart
            );
            if (shippingCoupon.getCouponType() != com.haui.ZenBook.enums.CouponType.SHIPPING) {
                throw new AppException(ErrorCode.COUPON_NOT_FOUND);
            }
            if (shippingCoupon.getDiscountType() == com.haui.ZenBook.enums.DiscountType.PERCENTAGE) {
                shippingDiscount = shippingFee * (shippingCoupon.getDiscountValue() / 100.0);
                if (shippingCoupon.getMaxDiscountAmount() != null) {
                    shippingDiscount = Math.min(shippingDiscount, shippingCoupon.getMaxDiscountAmount());
                }
            } else {
                shippingDiscount = shippingCoupon.getDiscountValue();
            }
            shippingDiscount = Math.min(shippingDiscount, shippingFee);
            appliedCouponCodes.add(request.getShippingCouponCode());
        }

        // Tách đôi totalDiscount (Phụ thuộc vào DB Order Entity hiện tại của bạn)
        // Lưu ý: Nếu DB của bạn đã tách orderDiscount và shippingDiscount ra làm 2 trường riêng thì lưu riêng
        // Nếu DB chỉ có discountAmount thì dùng tổng.
        // Tôi giả định bạn đã sửa OrderEntity thành orderDiscount và shippingDiscount theo tin nhắn trước.
        double totalDiscountAmount = orderDiscount + shippingDiscount;
        double finalTotal = Math.max(rawOrderTotal - orderDiscount + shippingFee - shippingDiscount, 0);
        String combinedCoupons = String.join(", ", appliedCouponCodes);

        OrderEntity newOrder = OrderEntity.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(method.toUpperCase())
                .note(request.getNote())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .shippingFee(shippingFee)
                .orderDiscount(orderDiscount)
                .shippingDiscount(shippingDiscount)
                .discountAmount(totalDiscountAmount)
                .finalTotal(finalTotal)
                .couponCode(combinedCoupons.isEmpty() ? null : combinedCoupons)
                .build();

        processOrderItems(newOrder, request.getItems());
        recordHistory(newOrder, null, OrderStatus.PENDING, actionBy, role, "Tạo đơn hàng mới với phương thức " + method.toUpperCase());

        OrderEntity savedOrder = orderRepository.save(newOrder);

        List<String> purchasedBookIds = request.getItems().stream()
                .map(OrderItemRequest::getBookId)
                .collect(Collectors.toList());
        cartService.removeItemsByBookIds(actionBy, purchasedBookIds);

        if (request.getOrderCouponCode() != null && !request.getOrderCouponCode().isBlank()) {
            couponService.incrementUsedCount(request.getOrderCouponCode());
        }
        if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().isBlank()) {
            couponService.incrementUsedCount(request.getShippingCouponCode());
        }

        OrderResponse response = orderMapper.toOrderResponse(savedOrder);

        // 👉 GỌI EMAIL SERVICE GỬI MAIL "ĐẶT HÀNG THÀNH CÔNG"
        if (PAYMENT_METHOD_COD.equalsIgnoreCase(method)) {
            emailService.sendOrderConfirmationEmail(response);
        }
        // NẾU LÀ VNPAY: Không gửi mail ở đây. Sẽ gửi mail ở bên API Xử lý Callback từ VNPAY về.

        return response;
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(String orderId, OrderUpdateRequest request, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_UPDATE);
        }

        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());

        recordHistory(order, OrderStatus.PENDING, OrderStatus.PENDING, actionBy, role, "Chỉnh sửa thông tin giao hàng");
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus, String note, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderStatus oldStatus = order.getStatus();

        if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.RETURNED) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        if (newStatus == OrderStatus.RETURNED) {
            if (oldStatus != OrderStatus.COMPLETED) {
                throw new AppException(ErrorCode.ORDER_RETURN_NOT_COMPLETED, order.getOrderCode());
            }
            LocalDateTime completedAt = order.getUpdatedAt();
            if (completedAt != null && completedAt.plusDays(7).isBefore(LocalDateTime.now())) {
                throw new AppException(ErrorCode.ORDER_RETURN_EXPIRED, order.getOrderCode());
            }
        }

        boolean valid = switch (oldStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PACKING;
            case PACKING -> newStatus == OrderStatus.SHIPPING;
            case SHIPPING -> newStatus == OrderStatus.COMPLETED;
            case COMPLETED -> newStatus == OrderStatus.RETURNED;
            default -> false;
        };

        if (!valid) throw new AppException(ErrorCode.ORDER_STATUS_INVALID);

        if (newStatus == OrderStatus.COMPLETED) {
            if (PAYMENT_METHOD_COD.equalsIgnoreCase(order.getPaymentMethod())) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }
        }

        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.RETURNED) {
            for (OrderDetailEntity detail : order.getDetails()) {
                BookEntity b = detail.getBook();
                b.setStockQuantity(b.getStockQuantity() + detail.getQuantity());
                int currentSold = b.getSoldQuantity() != null ? b.getSoldQuantity() : 0;
                b.setSoldQuantity(Math.max(currentSold - detail.getQuantity(), 0));
                bookRepository.save(b);
            }

            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
            }
        }

        order.setStatus(newStatus);
        recordHistory(order, oldStatus, newStatus, actionBy, role, note);
        OrderEntity savedOrder = orderRepository.save(order);

        OrderResponse response = orderMapper.toOrderResponse(savedOrder);

        // 👉 GỌI EMAIL SERVICE NẾU TRẠNG THÁI CÓ SỰ THAY ĐỔI
        if (oldStatus != newStatus) {
            emailService.sendOrderStatusEmail(response);
        }

        return response;
    }

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
            int currentSold = book.getSoldQuantity() != null ? book.getSoldQuantity() : 0;
            book.setSoldQuantity(currentSold + itemReq.getQuantity());
            bookRepository.save(book);

            double promoPrice = promotionService.getPromotionalPrice(book);
            double actualPrice = (promoPrice > 0) ? promoPrice : book.getSalePrice();
            double subTotal = itemReq.getQuantity() * actualPrice;
            totalItemsPrice += subTotal;

            order.getDetails().add(OrderDetailEntity.builder()
                    .order(order).book(book).quantity(itemReq.getQuantity())
                    .priceAtPurchase(actualPrice).subTotal(subTotal).build());
        }
        order.setTotalItemsPrice(totalItemsPrice);
    }

    private void recordHistory(OrderEntity order, OrderStatus from, OrderStatus to, String by, ActionRole role, String note) {
        if (order.getHistories() == null) order.setHistories(new ArrayList<>());
        order.getHistories().add(OrderHistoryEntity.builder()
                .order(order).fromStatus(from).toStatus(to)
                .actionBy(by).role(role).note(note).build());
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus s, String startDate, String endDate, Pageable p) {
        LocalDateTime start = StringUtils.hasText(startDate) ? LocalDate.parse(startDate).atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime end = StringUtils.hasText(endDate) ? LocalDate.parse(endDate).atTime(23, 59, 59) : LocalDateTime.now().plusYears(10);

        if (s != null) {
            return orderRepository.findByStatusAndCreatedAtBetween(s, start, end, p).map(orderMapper::toOrderResponse);
        } else {
            return orderRepository.findByCreatedAtBetween(start, end, p).map(orderMapper::toOrderResponse);
        }
    }

    @Override
    public Page<OrderResponse> getMyOrders(String userId, OrderStatus status, Pageable p) {
        if (status != null) {
            return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, p)
                    .map(orderMapper::toOrderResponse)
                    .map(this::enrichOrderResponse);
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, p)
                .map(orderMapper::toOrderResponse)
                .map(this::enrichOrderResponse);
    }

    @Override
    public OrderResponse getOrderById(String id) {
        OrderResponse response = orderRepository.findById(id)
                .map(orderMapper::toOrderResponse)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return enrichOrderResponse(response);
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

    private OrderResponse enrichOrderResponse(OrderResponse response) {
        if (response == null || response.getDetails() == null || response.getUserId() == null) {
            return response;
        }

        response.getDetails().forEach(detail -> {
            boolean hasReviewed = reviewRepository.existsByOrderDetailIdAndDeletedAtIsNull(
                    detail.getId()
            );

            detail.setIsReviewed(hasReviewed);
        });

        return response;
    }
}