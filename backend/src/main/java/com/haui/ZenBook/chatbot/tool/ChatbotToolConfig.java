package com.haui.ZenBook.chatbot.tool;

import com.haui.ZenBook.chatbot.service.BookSearchAiService;
import com.haui.ZenBook.chatbot.tool.dto.AiBookDto;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.service.CartService;
import com.haui.ZenBook.service.CouponService;
import com.haui.ZenBook.service.OrderService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class ChatbotToolConfig {

    public record SearchBookRequest(String keyword) {
    }

    @Bean("searchBookTool")
    @Description("Tìm kiếm sách. Đầu vào: từ khóa (keyword). Dùng khi khách hỏi tên sách, tác giả.")
    public Function<SearchBookRequest, String> searchBookTool(BookSearchAiService aiSearchService) {
        return request -> {
            try {
                // Gọi qua Service trung gian để kích hoạt Cache
                List<AiBookDto.SearchResponse> books = aiSearchService.search(request.keyword());

                if (books.isEmpty()) {
                    return "SYSTEM_ALERT: Không có sách nào khớp với '" + request.keyword() + "'. KHÔNG ĐƯỢC TỰ BỊA TÊN SÁCH.";
                }

                return "Kết quả tìm kiếm:\n" + books.stream()
                        .map(b -> String.format("- ID: %s | Tên: %s | Giá: %.0fđ | Tồn kho: %d",
                                b.id(), b.title(), b.price(), b.stock()))
                        .collect(Collectors.joining("\n"));
            } catch (Exception e) {
                return "Lỗi tìm kiếm: " + e.getMessage();
            }
        };
    }

    public record CheckCouponRequest(String userId) {
    }

    // 2. Định nghĩa Bean checkCouponTool
    @Bean("checkCouponTool") // 👉 Tên Bean phải khớp 100% với ChatService
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
                e.printStackTrace(); // 👉 Để hiện lỗi đỏ ở Console IntelliJ
                return "SYSTEM_ALERT: Lỗi hệ thống khi lấy giỏ hàng: " + e.toString(); // Báo cho AI biết có lỗi
            }
        };
    }

    public record AddCartRequest(String userId, String bookId, Integer quantity) {
    }


    @Bean("addToCartTool")
    @Description("Dùng để thêm sách vào giỏ hàng. " +
            "Tham số: bookId (chuỗi mã sách, ví dụ 'bk-012'), " +
            "quantity (số lượng, mặc định là 1 nếu khách không nói cụ thể), " +
            "userId (ID của người dùng hiện tại). " +
            "Hãy gọi tool này ngay khi khách hàng yêu cầu thêm/mua một cuốn sách cụ thể.")
    public Function<AddCartRequest, String> addToCartTool(CartService cartService, com.haui.ZenBook.repository.UserRepository userRepository) {
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST")) {
                return "Dạ, bạn cần đăng nhập để mua hàng nhé!";
            }
            try {
                // 👉 Tương tự, dịch ID sang Email
                var user = userRepository.findById(request.userId())
                        .orElseThrow(() -> new Exception("Không tìm thấy thông tin user trong DB"));
                String userEmail = user.getEmail();

                int qty = (request.quantity() != null && request.quantity() > 0) ? request.quantity() : 1;

                com.haui.ZenBook.dto.cart.CartItemRequest itemReq = new com.haui.ZenBook.dto.cart.CartItemRequest();
                itemReq.setBookId(request.bookId());
                itemReq.setQuantity(qty);

                var cart = cartService.addToCart(userEmail, itemReq); // Ném email vào
                return "SUCCESS: Đã thêm vào giỏ. Tổng tiền hiện tại: " + cart.getTotalPrice() + "đ.";
            } catch (Exception e) {
                e.printStackTrace();
                return "ERROR: " + e.getMessage();
            }
        };
    }

    // Trong file ChatbotToolConfig.java

    // 1. Đảm bảo có record request này
    public record ViewCartRequest(String userId) {
    }

    // 2. Kiểm tra Bean này
    @Bean("viewCartTool")
    @Description("Xem chi tiết giỏ hàng hiện tại của người dùng, bao gồm danh sách sách và tổng tiền.")
    public Function<ViewCartRequest, String> viewCartTool(CartService cartService, com.haui.ZenBook.repository.UserRepository userRepository) {
        return request -> {
            if (request.userId() == null || request.userId().equals("GUEST") || request.userId().isBlank()) {
                return "Dạ, bạn vui lòng đăng nhập để mình kiểm tra giỏ hàng giúp bạn nhé!";
            }

            try {
                // 👉 BƯỚC QUAN TRỌNG: Lấy email từ userId để hợp rơ với logic của CartService
                var user = userRepository.findById(request.userId())
                        .orElseThrow(() -> new Exception("Không tìm thấy thông tin user trong DB"));
                String userEmail = user.getEmail(); // Lấy email ra

                var cart = cartService.getCart(userEmail); // Ném email vào thay vì ném ID

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

    // 2. Định nghĩa Bean checkOrderTool
    @Bean("checkOrderTool") // 👈 Tên này phải khớp 100% với ChatService
    @Description("Tra cứu thông tin đơn hàng. Cung cấp orderCode (nếu có) và userId để tìm đơn hàng mới nhất.")
    public Function<CheckOrderRequest, String> checkOrderTool(OrderService orderService) {
        return request -> {
            // Kiểm tra đăng nhập
            if (request.userId() == null || request.userId().equals("GUEST")) {
                return "Dạ, bạn cần đăng nhập để mình kiểm tra đơn hàng giúp nhé!";
            }

            try {
                // Trường hợp 1: Khách hỏi về một mã đơn cụ thể (VD: "Đơn ZB-123 của tôi đâu?")
                if (request.orderCode() != null && !request.orderCode().isBlank()) {
                    // Giả định OrderService của bạn có hàm lấy đơn theo code hoặc quét qua list
                    var order = orderService.getOrderById(request.orderCode());
                    if (order != null) return formatOrderResponse(order);
                    return "Dạ, mình không tìm thấy đơn hàng mã " + request.orderCode() + " của bạn ạ.";
                }

                // Trường hợp 2: Khách hỏi chung chung "Đơn hàng của tôi đâu?" -> Lấy đơn mới nhất
                var myOrders = orderService.getMyOrders(request.userId(), null, org.springframework.data.domain.PageRequest.of(0, 1));
                if (myOrders.isEmpty()) return "Bạn chưa có đơn hàng nào trên hệ thống ZenBook ạ.";

                return "Đây là thông tin đơn hàng gần nhất của bạn:\n" + formatOrderResponse(myOrders.getContent().get(0));

            } catch (Exception e) {
                e.printStackTrace(); // 👉 Để hiện lỗi đỏ ở Console IntelliJ
                return "SYSTEM_ALERT: Lỗi hệ thống khi lấy giỏ hàng: " + e.toString(); // Báo cho AI biết có lỗi
            }
        };
    }

    // Hàm phụ để định dạng nội dung trả về cho AI đọc
    private String formatOrderResponse(com.haui.ZenBook.dto.order.OrderResponse o) {
        return String.format("- Mã đơn: %s\n- Ngày đặt: %s\n- Trạng thái: %s\n- Tổng tiền: %.0fđ",
                o.getOrderCode(), o.getCreatedAt(), o.getStatus(), o.getFinalTotal());
    }

}