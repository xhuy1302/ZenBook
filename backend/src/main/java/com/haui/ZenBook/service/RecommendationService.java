package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.book.BookResponse;
import com.haui.ZenBook.dto.AiRecommendation.AiRecommendationResponse;
import com.haui.ZenBook.dto.AiRecommendation.RecommendationSectionDto;
import com.haui.ZenBook.entity.BookEntity;
// 👉 Import thêm các Entity của bạn (Giả sử tên như bên dưới)
// import com.haui.ZenBook.entity.CartItemEntity;
// import com.haui.ZenBook.entity.WishlistEntity;
// import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.entity.CartDetailEntity;
import com.haui.ZenBook.entity.OrderEntity;
import com.haui.ZenBook.entity.WishlistEntity;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.CartRepository;
import com.haui.ZenBook.repository.OrderRepository;
// 👉 Import thêm các Repository
// import com.haui.ZenBook.repository.CartRepository;
// import com.haui.ZenBook.repository.WishlistRepository;
import com.haui.ZenBook.mapper.BookMapper;
import com.haui.ZenBook.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ChatClient chatClient;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final BookMapper bookMapper;

    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;

    @Cacheable(value = "bookRecommendations", key = "#userId", unless = "#result == null")
    public List<RecommendationSectionDto> getPersonalizedRecommendations(String userId) {
        log.info("Cache miss! Đang gọi AI để phân tích cho user: {}", userId);
        // 1. NẾU KHÁCH CHƯA ĐĂNG NHẬP (GUEST)
        if (userId == null || userId.trim().isEmpty() || userId.equals("GUEST")) {
            return getGuestRecommendations();
        }

        // 2. 👉 LẤY DỮ LIỆU THẬT CỦA USER TỪ DATABASE
        String cartItems = getCartTitles(userId);
        String wishlistItems = getWishlistTitles(userId);
        String purchaseHistory = getPurchaseHistoryTitles(userId);

        // Nếu bạn chưa làm bảng lưu Lịch sử xem (View) và Tìm kiếm (Search), cứ để rỗng. AI sẽ tự hiểu và bỏ qua.
        String viewedItems = "Không có dữ liệu";
        String searchHistory = "Không có dữ liệu";

        // Nếu người dùng mới tinh, chưa có hành vi gì -> Chuyển về hàm Gợi ý mặc định luôn cho tiết kiệm AI Token
        if (cartItems.equals("Trống") && wishlistItems.equals("Trống") && purchaseHistory.equals("Trống")) {
            return getGuestRecommendations();
        }

        String userBehaviorContext = String.format("""
            - Đang có trong giỏ hàng: %s
            - Đang nằm trong Wishlist (Yêu thích): %s
            - Vừa xem gần đây: %s
            - Lịch sử tìm kiếm: %s
            - Đã mua trong quá khứ: %s
            """, cartItems, wishlistItems, viewedItems, searchHistory, purchaseHistory);

        // 3. CUNG CẤP "THỰC ĐƠN" SÁCH ỨNG VIÊN CHO AI
        List<BookEntity> availableBooks = bookRepository.findAll(PageRequest.of(0, 50)).getContent();
        String bookCatalog = availableBooks.stream()
                .map(b -> String.format("- ID: %s | Tên: %s", b.getId(), b.getTitle()))
                .collect(Collectors.joining("\n"));

        // 4. CẤU HÌNH JSON CONVERTER
        var converter = new BeanOutputConverter<>(AiRecommendationResponse.class);

        // 5. SYSTEM PROMPT
        String systemPrompt = String.format("""
            Bạn là chuyên gia gợi ý sách của ZenBook.
            Nhiệm vụ của bạn là chọn ra các cuốn sách phù hợp nhất với hành vi người dùng, chia làm 3 danh mục (mỗi mục 4-5 cuốn).
            Tiêu đề danh mục phải cá nhân hóa (VD: "Vì bạn thích Đắc Nhân Tâm", "Phát triển bản thân mỗi ngày").
            
            🚨 QUY TẮC SỐNG CÒN:
            1. Bạn CHỈ ĐƯỢC PHÉP chọn sách từ "DANH MỤC SÁCH HIỆN CÓ" dưới đây. Tuyệt đối không tự bịa ra sách.
            2. Trả về đúng ID (chuỗi UUID) tương ứng với cuốn sách trong danh mục.
            3. Bắt buộc trả về đúng định dạng JSON.
            
            DANH MỤC SÁCH HIỆN CÓ (CHỈ CHỌN ID TỪ ĐÂY):
            %s
            
            ĐỊNH DẠNG JSON YÊU CẦU:
            %s
            """, bookCatalog, converter.getFormat());

        // 6. USER PROMPT
        String userPrompt = String.format("""
            Hành vi của người dùng:
            %s
            Hãy phân tích và trả về JSON.
            """, userBehaviorContext);

        try {
            // 7. GỌI LLM
            String llmResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            // 8. PARSE VÀ QUERY DB
            AiRecommendationResponse aiResult = converter.convert(llmResponse);
            List<RecommendationSectionDto> finalResult = new ArrayList<>();

            if (aiResult != null && aiResult.sections() != null) {
                for (AiRecommendationResponse.Section section : aiResult.sections()) {
                    List<BookEntity> books = bookRepository.findAllById(section.ids());
                    if (!books.isEmpty()) {
                        List<BookResponse> bookDtos = books.stream()
                                .map(bookMapper::toResponse)
                                .collect(Collectors.toList());
                        finalResult.add(new RecommendationSectionDto(section.title(), bookDtos));
                    }
                }
            }
            return finalResult;

        } catch (Exception e) {
            log.error("Lỗi khi gọi AI Recommendation: ", e);
            return getGuestRecommendations();
        }
    }

    // =========================================================================
    // 👉 CÁC HÀM HELPER: LẤY DỮ LIỆU THẬT TỪ DATABASE
    // Bạn hãy uncomment (bỏ dấu //) và điều chỉnh tên method cho khớp Entity của bạn
    // =========================================================================

    private String getCartTitles(String userId) {
        // Tìm giỏ hàng theo userId
        return cartRepository.findByUserId(userId)
                .map(cart -> {
                    if (cart.getDetails() == null || cart.getDetails().isEmpty()) {
                        return "Trống";
                    }
                    return cart.getDetails().stream()
                            .map(item -> item.getBook().getTitle()) // Lấy tên sách từ CartItem
                            .collect(Collectors.joining(", "));
                })
                .orElse("Trống");
    }

    private String getWishlistTitles(String userId) {
        // Sử dụng hàm findAllByUserIdWithBook đã có sẵn trong WishlistRepository của bạn
        List<WishlistEntity> wishlists = wishlistRepository.findAllByUserIdWithBook(userId);

        if (wishlists == null || wishlists.isEmpty()) {
            return "Trống";
        }

        return wishlists.stream()
                .map(w -> w.getBook().getTitle()) // Lấy tên sách
                .collect(Collectors.joining(", "));
    }

    private String getPurchaseHistoryTitles(String userId) {
        List<OrderEntity> orders = orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        if (orders == null || orders.isEmpty()) {
            return "Trống";
        }

        return orders.stream()
                // 👉 Đã sửa thành getDetails() theo đúng Entity của bạn
                .flatMap(order -> order.getDetails().stream())

                // Giả định trong OrderDetailEntity bạn có hàm getBook()
                .map(detail -> detail.getBook().getTitle())

                .distinct()
                .collect(Collectors.joining(", "));
    }

    private List<RecommendationSectionDto> getGuestRecommendations() {
        List<RecommendationSectionDto> sections = new ArrayList<>();
        try {
            List<BookEntity> trendingBooks = bookRepository.findAll(PageRequest.of(0, 10)).getContent();
            if (!trendingBooks.isEmpty()) {
                List<BookResponse> bookDtos = trendingBooks.stream()
                        .map(bookMapper::toResponse)
                        .collect(Collectors.toList());
                sections.add(new RecommendationSectionDto("🔥 Sách Nổi Bật Hôm Nay", bookDtos));
            }
        } catch (Exception e) {
            log.error("Lỗi khi lấy sách cho Guest: ", e);
        }
        return sections;
    }
}