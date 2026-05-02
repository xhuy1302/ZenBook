package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.coupon.CouponResponse;
import com.haui.ZenBook.dto.order.OrderCreateRequest;
import com.haui.ZenBook.dto.order.OrderItemRequest;
import com.haui.ZenBook.dto.order.OrderResponse;
import com.haui.ZenBook.dto.order.OrderUpdateRequest;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.*;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.OrderMapper;
import com.haui.ZenBook.repository.*;
import com.haui.ZenBook.dto.chat.ChatMessageResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.haui.ZenBook.shipping.GHNShippingProvider;
import com.haui.ZenBook.shipping.ShippingCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict; // 👉 Import quan trọng
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
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
    private final EmailService emailService;
    private final MembershipService membershipService;
    private final NotificationService notificationService;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private static final String PAYMENT_METHOD_COD = "COD";
    private static final String PAYMENT_METHOD_VNPAY = "VNPAY";
    private static final String SYSTEM_ADMIN_ID = "00000000-0000-7000-0000-000000000100";

    @Override
    @Transactional
    // 👉 Xóa cache gợi ý khi người dùng đặt hàng thành công
    @CacheEvict(value = "bookRecommendations", key = "#userId")
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

        MembershipEntity membership = membershipService.getOrCreateMembership(userId);

        if (membership.getTier() == MemberTier.PLATINUM || membership.getTier() == MemberTier.DIAMOND) {
            shippingDiscount = shippingFee;
        }
        else if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().isBlank()) {
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
        recordHistory(newOrder, null, OrderStatus.PENDING, actionBy, role, "Tạo đơn hàng mới");

        OrderEntity savedOrder = orderRepository.save(newOrder);

        List<String> purchasedBookIds = request.getItems().stream()
                .map(OrderItemRequest::getBookId)
                .collect(Collectors.toList());
        cartService.removeItemsByBookIds(actionBy, purchasedBookIds);

        if (request.getOrderCouponCode() != null && !request.getOrderCouponCode().isBlank()) {
            couponService.incrementUsedCount(request.getOrderCouponCode());
        }
        if (request.getShippingCouponCode() != null && !request.getShippingCouponCode().isBlank()
                && (membership.getTier() != MemberTier.PLATINUM && membership.getTier() != MemberTier.DIAMOND)) {
            couponService.incrementUsedCount(request.getShippingCouponCode());
        }

        OrderResponse response = orderMapper.toOrderResponse(savedOrder);
        if (PAYMENT_METHOD_COD.equalsIgnoreCase(method)) {
            emailService.sendOrderConfirmationEmail(response);
        }

        try {
            notificationService.notifyOrder(userId, savedOrder.getOrderCode(), "Đơn hàng đã xác nhận", "Đơn hàng #" + savedOrder.getOrderCode() + " đã được tạo thành công.");
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo", e);
        }

        sendAutoChatMessage(savedOrder, userId, "Chúng tôi sẽ sớm xác nhận đơn hàng của bạn.");
        return response;
    }

    private void sendAutoChatMessage(OrderEntity order, String userId, String customMessage) {
        try {
            ChatRoomEntity room = chatRoomRepository.findByUserId(userId).orElse(null);
            if (room == null) return;
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("orderId", order.getId());
            orderData.put("orderCode", order.getOrderCode());
            orderData.put("total", order.getFinalTotal());
            orderData.put("paymentMethod", order.getPaymentMethod());
            orderData.put("message", customMessage);
            String jsonContent = objectMapper.writeValueAsString(orderData);
            MessageEntity autoMsg = new MessageEntity();
            autoMsg.setRoomId(room.getId());
            autoMsg.setSenderId(SYSTEM_ADMIN_ID);
            autoMsg.setReceiverId(userId);
            autoMsg.setMessageType(MessageType.ORDER);
            autoMsg.setContent(jsonContent);
            autoMsg.setStatus(MessageStatus.SENT);
            autoMsg.setCreatedAt(LocalDateTime.now());
            messageRepository.save(autoMsg);
            ChatMessageResponse msgResponse = ChatMessageResponse.builder()
                    .id(autoMsg.getId()).roomId(autoMsg.getRoomId()).senderId(autoMsg.getSenderId())
                    .content(autoMsg.getContent()).messageType(autoMsg.getMessageType())
                    .status(autoMsg.getStatus()).createdAt(autoMsg.getCreatedAt()).build();
            messagingTemplate.convertAndSend("/topic/messages." + userId, msgResponse);
            room.setUpdatedAt(LocalDateTime.now());
            chatRoomRepository.save(room);
        } catch (Exception e) {
            log.error("Lỗi chat tự động", e);
        }
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus, String note, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseGet(() -> orderRepository.findByOrderCode(orderId)
                        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND)));
        boolean isOwner = (actionBy != null) && (actionBy.equals(order.getUserId()) || actionBy.equalsIgnoreCase(order.getCustomerEmail()));
        if (isOwner && role != ActionRole.USER && newStatus != OrderStatus.CANCELLED) throw new AppException(ErrorCode.INVALID_ACTION);
        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.RETURNED) throw new AppException(ErrorCode.ORDER_STATUS_INVALID);

        if (newStatus == OrderStatus.RETURNED) {
            if (oldStatus != OrderStatus.COMPLETED) throw new AppException(ErrorCode.ORDER_RETURN_NOT_COMPLETED, order.getId());
            LocalDateTime completedAt = order.getUpdatedAt();
            MembershipEntity membership = membershipService.getOrCreateMembership(order.getUserId());
            int returnDaysAllowed = (membership.getTier() == MemberTier.GOLD || membership.getTier() == MemberTier.PLATINUM || membership.getTier() == MemberTier.DIAMOND) ? 14 : 7;
            if (completedAt != null && completedAt.plusDays(returnDaysAllowed).isBefore(LocalDateTime.now())) throw new AppException(ErrorCode.ORDER_RETURN_EXPIRED, order.getOrderCode());
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
            if ("COD".equalsIgnoreCase(order.getPaymentMethod()) && order.getPaymentStatus() == PaymentStatus.UNPAID) order.setPaymentStatus(PaymentStatus.PAID);
            membershipService.processOrderCompletion(order);
            sendAutoChatMessage(order, order.getUserId(), "🎊 Đơn hàng đã hoàn tất. Cảm ơn bạn!");
        }

        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.RETURNED) {
            for (OrderDetailEntity detail : order.getDetails()) {
                BookEntity b = detail.getBook();
                b.setStockQuantity(b.getStockQuantity() + detail.getQuantity());
                int currentSold = b.getSoldQuantity() != null ? b.getSoldQuantity() : 0;
                b.setSoldQuantity(Math.max(currentSold - detail.getQuantity(), 0));
                bookRepository.save(b);
            }
            if (order.getPaymentStatus() == PaymentStatus.PAID) order.setPaymentStatus(PaymentStatus.REFUNDED);
            if (newStatus == OrderStatus.RETURNED) membershipService.processOrderRefund(order);
        }

        order.setStatus(newStatus);
        recordHistory(order, oldStatus, newStatus, actionBy, role, note);
        OrderEntity savedOrder = orderRepository.save(order);
        OrderResponse response = orderMapper.toOrderResponse(savedOrder);
        if (oldStatus != newStatus) emailService.sendOrderStatusEmail(response);

        try {
            notificationService.notifyOrder(order.getUserId(), order.getOrderCode(), "Cập nhật đơn hàng", "Đơn hàng #" + order.getOrderCode() + " đã chuyển sang " + newStatus.name());
        } catch (Exception e) { log.error("Lỗi thông báo", e); }

        return response;
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(String orderId, OrderUpdateRequest request, String actionBy, ActionRole role) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseGet(() -> orderRepository.findByOrderCode(orderId)
                        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND)));
        if (role == ActionRole.USER && !order.getCustomerEmail().equalsIgnoreCase(actionBy) && !order.getUserId().equals(actionBy)) throw new AppException(ErrorCode.ACCESS_DENIED);
        if (order.getStatus() != OrderStatus.PENDING) throw new AppException(ErrorCode.ORDER_CANNOT_UPDATE);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());
        recordHistory(order, OrderStatus.PENDING, OrderStatus.PENDING, actionBy, role, "Cập nhật thông tin");
        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    private void processOrderItems(OrderEntity order, List<OrderItemRequest> items) {
        double totalItemsPrice = 0.0;
        if (order.getDetails() == null) order.setDetails(new ArrayList<>());
        for (OrderItemRequest itemReq : items) {
            BookEntity book = bookRepository.findById(itemReq.getBookId()).orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
            if (book.getDeletedAt() != null || !BookStatus.ACTIVE.equals(book.getStatus())) throw new AppException(ErrorCode.BOOK_NOT_ACTIVE);
            if (book.getStockQuantity() < itemReq.getQuantity()) throw new AppException(ErrorCode.BOOK_STOCK_INVALID);
            book.setStockQuantity(book.getStockQuantity() - itemReq.getQuantity());
            int currentSold = book.getSoldQuantity() != null ? book.getSoldQuantity() : 0;
            book.setSoldQuantity(currentSold + itemReq.getQuantity());
            bookRepository.save(book);
            double promoPrice = promotionService.getPromotionalPrice(book);
            double actualPrice = (promoPrice > 0) ? promoPrice : book.getSalePrice();
            double subTotal = itemReq.getQuantity() * actualPrice;
            totalItemsPrice += subTotal;
            order.getDetails().add(OrderDetailEntity.builder().order(order).book(book).quantity(itemReq.getQuantity()).priceAtPurchase(actualPrice).subTotal(subTotal).build());
        }
        order.setTotalItemsPrice(totalItemsPrice);
    }

    private void recordHistory(OrderEntity order, OrderStatus from, OrderStatus to, String by, ActionRole role, String note) {
        if (order.getHistories() == null) order.setHistories(new ArrayList<>());
        order.getHistories().add(OrderHistoryEntity.builder().order(order).fromStatus(from).toStatus(to).actionBy(by).role(role).note(note).build());
    }

    @Override
    public Page<OrderResponse> getAllOrders(OrderStatus s, String start, String end, Pageable p) {
        LocalDateTime startDate = StringUtils.hasText(start) ? LocalDate.parse(start).atStartOfDay() : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime endDate = StringUtils.hasText(end) ? LocalDate.parse(end).atTime(23, 59, 59) : LocalDateTime.now().plusYears(10);
        if (s != null) return orderRepository.findByStatusAndCreatedAtBetween(s, startDate, endDate, p).map(orderMapper::toOrderResponse);
        return orderRepository.findByCreatedAtBetween(startDate, endDate, p).map(orderMapper::toOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(String userId, OrderStatus status, Pageable p) {
        if (status != null) return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, p).map(orderMapper::toOrderResponse).map(this::enrichOrderResponse);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, p).map(orderMapper::toOrderResponse).map(this::enrichOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String idOrCode) {
        OrderEntity order = orderRepository.findById(idOrCode).orElseGet(() -> orderRepository.findByOrderCode(idOrCode).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND)));
        return enrichOrderResponse(orderMapper.toOrderResponse(order));
    }

    @Override
    public long countPendingOrders() { return orderRepository.countByStatus(OrderStatus.PENDING); }

    private String generateOrderCode() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        String prefix = "ZB-" + date;
        String max = orderRepository.findMaxOrderCodeByDate(prefix);
        int next = (max == null) ? 1 : Integer.parseInt(max.substring(max.lastIndexOf("-") + 1)) + 1;
        return String.format("%s-%03d", prefix, next);
    }

    private OrderResponse enrichOrderResponse(OrderResponse response) {
        if (response == null || response.getDetails() == null) return response;
        response.getDetails().forEach(detail -> detail.setIsReviewed(reviewRepository.existsByOrderDetailIdAndDeletedAtIsNull(detail.getId())));
        return response;
    }
}