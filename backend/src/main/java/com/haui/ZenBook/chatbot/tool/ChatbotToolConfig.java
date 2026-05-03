package com.haui.ZenBook.chatbot.tool;

import com.haui.ZenBook.chatbot.service.BookSearchAiService;
import com.haui.ZenBook.chatbot.tool.dto.AiBookDto;
import com.haui.ZenBook.entity.CouponEntity;
import com.haui.ZenBook.enums.CouponStatus;
import com.haui.ZenBook.enums.CouponType;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.CouponRepository;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.service.CartService;
import com.haui.ZenBook.service.CouponService;
import com.haui.ZenBook.service.OrderService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class ChatbotToolConfig {

    // ==========================================
    // 1. TÌM KIẾM SÁCH (CÓ LINK CLICK ĐƯỢC VÀ LỌC GIÁ)
    // ==========================================
    public record SearchBookRequest(String keyword, Double minPrice, Double maxPrice) {
    }

    @Bean("searchBookTool")
    @Description("""
        Tìm kiếm sách trong cửa hàng. 
        - keyword: từ khóa tên sách, tác giả hoặc thể loại. NẾU KHÁCH KHÔNG NÊU RÕ TÊN SÁCH, BẮT BUỘC ĐỂ KEYWORD LÀ CHUỖI RỖNG "". TUYỆT ĐỐI KHÔNG điền các từ chung như "sách".
        - minPrice: giá thấp nhất. 
        - maxPrice: giá cao nhất.
        
        ⚠️ LUẬT VỀ GIÁ (QUAN TRỌNG): 
        - Nếu khách hỏi giá "BẰNG" hoặc "ĐÚNG" một số tiền (VD: "sách giá 50k"), BẮT BUỘC phải điền số tiền đó vào CẢ minPrice VÀ maxPrice.
        - Nếu khách không nhắc đến giá, để minPrice và maxPrice là null. Không lấy giá từ câu hỏi cũ.
        """)
    public Function<SearchBookRequest, String> searchBookTool(BookSearchAiService aiSearchService) {
        return request -> {
            try {
                System.out.println("🤖 AI GỌI TOOL SEARCH => keyword: '" + request.keyword() + "', minPrice: " + request.minPrice() + ", maxPrice: " + request.maxPrice());

                List<AiBookDto.SearchResponse> books = aiSearchService.search(
                        request.keyword(),
                        request.minPrice(),
                        request.maxPrice()
                );

                if (books.isEmpty()) {
                    return "SYSTEM_ALERT: Không có sách nào khớp yêu cầu. KHÔNG ĐƯỢC TỰ BỊA TÊN SÁCH.";
                }

                return "Kết quả tìm kiếm:\n" + books.stream()
                        .map(b -> String.format("- ID: %s | [%s](/products/%s) | Giá: %.0fđ | Tồn kho: %d",
                                b.id(), b.title(), b.slug(), b.price(), b.stock()))
                        .collect(Collectors.joining("\n"));
            } catch (Exception e) {
                return "Lỗi tìm kiếm: " + e.getMessage();
            }
        };
    }

    // ==========================================
    // 2. THÊM VÀO GIỎ HÀNG (KIỂM TRA FREESHIP VÀ SỐ LƯỢNG)
    // ==========================================
    public record AddCartRequest(String userId, String bookId, Integer quantity) {
    }

    @Bean("addToCartTool")
    @Description("""
        Dùng để thêm sách vào giỏ hàng. 
        - bookId: Có thể truyền mã sách gốc HOẶC truyền 'slug' (phần đuôi của link sách, ví dụ: 'chi-pheo').
        - userId: ID khách hàng hiện tại.
        - quantity: Số lượng cần thêm.
        """)
    public Function<AddCartRequest, String> addToCartTool(CartService cartService, UserRepository userRepository, CouponRepository couponRepository, BookRepository bookRepository) { // 👉 THÊM BookRepository VÀO ĐÂY
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST")) {
                return "Dạ, bạn cần đăng nhập để mua hàng nhé!";
            }
            try {
                var user = userRepository.findById(request.userId())
                        .orElseThrow(() -> new Exception("Không tìm thấy thông tin user trong DB"));
                String userEmail = user.getEmail();

                int qty = (request.quantity() != null && request.quantity() > 0) ? request.quantity() : 1;

                // 👉 XỬ LÝ MA THUẬT: ĐỌC ID HOẶC SLUG MÀ AI TRUYỀN VÀO
                var bookOpt = bookRepository.findById(request.bookId());
                if (bookOpt.isEmpty()) {
                    // Thử tra bằng slug nếu AI truyền slug thay vì ID
                    bookOpt = bookRepository.findBySlug(request.bookId());
                }

                if (bookOpt.isEmpty()) {
                    return "LỖI: Hệ thống không tìm thấy mã sách hay slug là: " + request.bookId() + ". Hãy báo lỗi cho khách hàng.";
                }

                String realBookId = bookOpt.get().getId();

                com.haui.ZenBook.dto.cart.CartItemRequest itemReq = new com.haui.ZenBook.dto.cart.CartItemRequest();
                itemReq.setBookId(realBookId);
                itemReq.setQuantity(qty);

                var cart = cartService.addToCart(userEmail, itemReq);
                double total = cart.getTotalPrice();

                Optional<CouponEntity> freeshipCoupon = couponRepository
                        .findAllByStatusAndUserIdIsNullAndDeletedAtIsNullOrderByCreatedAtDesc(CouponStatus.ACTIVE)
                        .stream().filter(c -> c.getCouponType() == CouponType.SHIPPING).findFirst();

                String freeshipContext = "";
                if (freeshipCoupon.isPresent()) {
                    double minOrder = freeshipCoupon.get().getMinOrderValue();
                    double missingForFreeship = minOrder - total;
                    if (missingForFreeship > 0) {
                        freeshipContext = String.format("Khách CÒN THIẾU %.0fđ nữa để được dùng mã Freeship '%s'.", missingForFreeship, freeshipCoupon.get().getCode());
                    } else {
                        freeshipContext = "Khách ĐÃ ĐỦ điều kiện dùng mã Freeship " + freeshipCoupon.get().getCode() + " rồi.";
                    }
                }

                return "SUCCESS: Đã thêm " + qty + " cuốn vào giỏ. Tổng tiền hiện tại: " + total + "đ. " + freeshipContext;
            } catch (Exception e) {
                return "ERROR: " + e.getMessage();
            }
        };
    }

    // ==========================================
    // 3. XEM LỊCH SỬ MUA HÀNG (TRỢ LÝ CÁ NHÂN)
    // ==========================================
    public record PurchaseHistoryRequest(String userId) {}

    @Bean("checkPurchaseHistoryTool")
    @Description("Xem 3 đơn hàng gần nhất của khách hàng để biết họ hay đọc thể loại gì, từ đó gợi ý sách chuẩn hơn.")
    public Function<PurchaseHistoryRequest, String> checkPurchaseHistoryTool(OrderService orderService) {
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST")) {
                return "Khách chưa đăng nhập, không có lịch sử mua hàng.";
            }
            try {
                var orders = orderService.getMyOrders(request.userId(), null, PageRequest.of(0, 3));
                if (orders.isEmpty()) return "Khách hàng mới, chưa mua cuốn sách nào.";

                // Gom tên các cuốn sách khách đã mua
                String boughtBooks = orders.getContent().stream()
                        .flatMap(o -> o.getDetails().stream())
                        .map(d -> d.getBookTitle())
                        .distinct()
                        .collect(Collectors.joining(", "));

                return "Lịch sử mua hàng gần đây của khách: " + boughtBooks + ". Hãy dựa vào gu đọc sách này để gợi ý các cuốn tương tự.";
            } catch (Exception e) {
                return "Lỗi lấy lịch sử: " + e.getMessage();
            }
        };
    }

    // ==========================================
    // 4. LINK CHECKOUT & COUPON (CHỐT ĐƠN)
    // ==========================================
    public record GetCheckoutLinkRequest(String couponCode) {}

    @Bean("getCheckoutLinkTool")
    @Description("Tạo đường link dẫn khách hàng thẳng tới trang thanh toán, có thể đính kèm mã giảm giá.")
    public Function<GetCheckoutLinkRequest, String> getCheckoutLinkTool() {
        return request -> {
            String baseUrl = "/checkout";
            if (request.couponCode() != null && !request.couponCode().isBlank()) {
                baseUrl += "?coupon=" + request.couponCode();
            }
            // Trả về định dạng Markdown Link
            return "SUCCESS: Hãy gửi cho khách link sau để họ thanh toán: [Bấm vào đây để thanh toán ngay](" + baseUrl + ")";
        };
    }

    // ==========================================
    // 5. CÁC TOOL CƠ BẢN ĐÃ CÓ TỪ TRƯỚC
    // ==========================================

    public record CheckCouponRequest(String userId) {
    }

    @Bean("checkCouponTool")
    @Description("Liệt kê các mã giảm giá (voucher) đang hoạt động. Trả về mã chung và mã cá nhân.")
    public Function<CheckCouponRequest, String> checkCouponTool(CouponService couponService) {
        return request -> {
            try {
                String currentUserId = (request.userId() != null && !request.userId().equals("GUEST"))
                        ? request.userId() : null;
                var coupons = couponService.getAllActiveCoupons(currentUserId);

                if (coupons.isEmpty()) return "Hiện tại hệ thống không có mã ưu đãi nào.";

                return "Danh sách mã ưu đãi:\n" + coupons.stream()
                        .map(c -> String.format("- Mã: %s | Giảm: %.0f | Đơn tối thiểu: %.0fđ",
                                c.getCode(), c.getDiscountValue(), c.getMinOrderValue()))
                        .collect(Collectors.joining("\n"));
            } catch (Exception e) {
                e.printStackTrace();
                return "SYSTEM_ALERT: Lỗi hệ thống khi lấy giỏ hàng: " + e.toString();
            }
        };
    }

    public record ViewCartRequest(String userId) {
    }

    @Bean("viewCartTool")
    @Description("Xem chi tiết giỏ hàng hiện tại của người dùng, bao gồm danh sách sách và tổng tiền.")
    public Function<ViewCartRequest, String> viewCartTool(CartService cartService, UserRepository userRepository) {
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST") || request.userId().isBlank()) {
                return "Dạ, bạn vui lòng đăng nhập để mình kiểm tra giỏ hàng giúp bạn nhé!";
            }

            try {
                var user = userRepository.findById(request.userId())
                        .orElseThrow(() -> new Exception("Không tìm thấy thông tin user trong DB"));
                String userEmail = user.getEmail();

                var cart = cartService.getCart(userEmail);

                if (cart.getDetails() == null || cart.getDetails().isEmpty()) {
                    return "Giỏ hàng của bạn hiện đang trống.";
                }

                String items = cart.getDetails().stream()
                        .map(d -> String.format("- %s (Số lượng: %d) : %.0fđ",
                                d.getBookTitle(), d.getQuantity(), d.getPrice()))
                        .collect(Collectors.joining("\n"));

                return "Giỏ hàng của bạn gồm có:\n" + items + "\n=> TỔNG CỘNG: " + cart.getTotalPrice() + "đ";
            } catch (Exception e) {
                e.printStackTrace();
                return "SYSTEM_ALERT: Lỗi hệ thống khi lấy giỏ hàng: " + e.getMessage();
            }
        };
    }

    public record CheckOrderRequest(String orderCode, String userId) {
    }

    @Bean("checkOrderTool")
    @Description("Tra cứu thông tin đơn hàng. Cung cấp orderCode (nếu có) và userId để tìm đơn hàng mới nhất.")
    public Function<CheckOrderRequest, String> checkOrderTool(OrderService orderService) {
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST")) {
                return "Dạ, bạn cần đăng nhập để mình kiểm tra đơn hàng giúp nhé!";
            }

            try {
                if (request.orderCode() != null && !request.orderCode().isBlank()) {
                    var order = orderService.getOrderById(request.orderCode());
                    if (order != null) return formatOrderResponse(order);
                    return "Dạ, mình không tìm thấy đơn hàng mã " + request.orderCode() + " của bạn ạ.";
                }

                var myOrders = orderService.getMyOrders(request.userId(), null, org.springframework.data.domain.PageRequest.of(0, 1));
                if (myOrders.isEmpty()) return "Bạn chưa có đơn hàng nào trên hệ thống ZenBook ạ.";

                return "Đây là thông tin đơn hàng gần nhất của bạn:\n" + formatOrderResponse(myOrders.getContent().get(0));

            } catch (Exception e) {
                e.printStackTrace();
                return "SYSTEM_ALERT: Lỗi hệ thống khi lấy đơn hàng: " + e.toString();
            }
        };
    }

    private String formatOrderResponse(com.haui.ZenBook.dto.order.OrderResponse o) {
        return String.format("- Mã đơn: %s\n- Ngày đặt: %s\n- Trạng thái: %s\n- Tổng tiền: %.0fđ",
                o.getOrderCode(), o.getCreatedAt(), o.getStatus(), o.getFinalTotal());
    }

    public record UpdateCartRequest(String userId, String bookId, Integer quantity) {}

    @Bean("updateCartTool")
    @Description("Cập nhật lại số lượng sách trong giỏ hàng. Cần userId, bookId và số lượng mới.")
    public Function<UpdateCartRequest, String> updateCartTool(CartService cartService, UserRepository userRepository) {
        return request -> {
            try {
                if (request.userId() == null || request.userId().equals("GUEST")) return "Vui lòng đăng nhập.";
                var user = userRepository.findById(request.userId()).orElseThrow();
                var cart = cartService.updateCartItem(user.getEmail(), request.bookId(), request.quantity());
                return "Cập nhật thành công. Số lượng mới: " + request.quantity() + ". Tổng giỏ: " + cart.getTotalPrice() + "đ";
            } catch (Exception e) { return "Lỗi: " + e.getMessage(); }
        };
    }

    public record RemoveCartRequest(String userId, String bookId) {}

    @Bean("removeCartTool")
    @Description("Xóa hoàn toàn một cuốn sách khỏi giỏ hàng. Cần userId và bookId.")
    public Function<RemoveCartRequest, String> removeCartTool(CartService cartService, UserRepository userRepository) {
        return request -> {
            try {
                if (request.userId() == null || request.userId().equals("GUEST")) return "Vui lòng đăng nhập.";
                var user = userRepository.findById(request.userId()).orElseThrow();
                var cart = cartService.removeCartItem(user.getEmail(), request.bookId());
                return "Đã xóa sách khỏi giỏ. Tổng giỏ hiện tại: " + cart.getTotalPrice() + "đ";
            } catch (Exception e) { return "Lỗi: " + e.getMessage(); }
        };
    }

    public record SuggestBookRequest(String bookId) {}

    @Bean("suggestRelatedBooksTool")
    @Description("Tìm các cuốn sách liên quan (cùng thể loại) để gợi ý bán chéo (Upsell) cho khách hàng.")
    public Function<SuggestBookRequest, String> suggestRelatedBooksTool(BookRepository bookRepository) {
        return request -> {
            try {
                var bookOpt = bookRepository.findById(request.bookId());
                if (bookOpt.isEmpty()) return "Không tìm thấy sách gốc.";

                var categories = bookOpt.get().getCategories();
                if (categories.isEmpty()) return "Sách chưa có phân loại.";

                String categoryName = categories.iterator().next().getCategoryName();

                return "Gợi ý cho sách " + bookOpt.get().getTitle() + " (Thể loại: " + categoryName + "): Hãy bảo khách thử xem thêm các sách nổi bật cùng thể loại này. (Tự tìm bằng searchBookTool theo thể loại).";
            } catch (Exception e) { return "Lỗi hệ thống: " + e.getMessage(); }
        };
    }
}