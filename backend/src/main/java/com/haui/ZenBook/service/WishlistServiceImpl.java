package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.wishlist.*;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.entity.WishlistEntity;
import com.haui.ZenBook.mapper.WishlistMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.repository.WishlistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final WishlistMapper wishlistMapper;

    // 🔥 THÊM Ở ĐÂY: Inject PromotionService giống BookService
    private final PromotionService promotionService;

    // ==========================================
    // HELPER METHODS: XỬ LÝ LẤY USER TỪ JWT
    // ==========================================

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserEntity getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    private String getCurrentUserId() {
        return getCurrentUser().getId();
    }

    // 🔥 THÊM Ở ĐÂY: Hàm map dữ liệu + tính giá khuyến mãi y hệt BookServiceImpl
    private WishlistResponse mapToResponseWithDiscount(WishlistEntity wishlist) {
        if (wishlist == null || wishlist.getBook() == null) return null;

        WishlistResponse response = wishlistMapper.toResponse(wishlist);
        BookEntity book = wishlist.getBook();

        double promoPrice = promotionService.getPromotionalPrice(book);

        if (promoPrice > 0) {
            response.setSalePrice(promoPrice);
            if (response.getOriginalPrice() != null && response.getOriginalPrice() > 0) {
                int discountPercent = (int) Math.round((1 - (promoPrice / response.getOriginalPrice())) * 100);
                response.setDiscount(discountPercent);
            }
        } else {
            // Nếu không có khuyến mãi, giá bán = giá gốc, discount = 0
            response.setSalePrice(response.getOriginalPrice());
            response.setDiscount(0);
        }

        return response;
    }

    // ==========================================
    // MAIN BUSINESS LOGIC
    // ==========================================

    @Override
    @Transactional
    public void addToWishlist(WishlistRequest request) {
        UserEntity user = getCurrentUser();

        if (wishlistRepository.existsByUserIdAndBookId(user.getId(), request.getBookId())) {
            return;
        }

        BookEntity book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));

        WishlistEntity wishlist = WishlistEntity.builder()
                .user(user)
                .book(book)
                .build();

        wishlistRepository.save(wishlist);
    }

    @Override
    @Transactional
    public void removeFromWishlist(String bookId) {
        wishlistRepository.deleteByUserIdAndBookId(getCurrentUserId(), bookId);
    }

    @Override
    @Transactional(readOnly = true) // 🔥 THÊM Ở ĐÂY
    public List<WishlistResponse> getMyWishlist() {
        return wishlistRepository.findAllByUserIdWithBook(getCurrentUserId())
                .stream()
                .map(this::mapToResponseWithDiscount) // 🔥 SỬA Ở ĐÂY
                .collect(Collectors.toList());
    }

    @Override
    public WishlistCheckResponse checkInWishlist(String bookId) {
        boolean exists = wishlistRepository.existsByUserIdAndBookId(getCurrentUserId(), bookId);
        return WishlistCheckResponse.builder().inWishlist(exists).build();
    }

    @Override
    public WishlistCountResponse countMyWishlist() {
        long count = wishlistRepository.countByUserId(getCurrentUserId());
        return WishlistCountResponse.builder().count(count).build();
    }

    @Override
    @Transactional
    public WishlistToggleResponse toggleWishlist(String bookId) {
        String userId = getCurrentUserId();
        boolean exists = wishlistRepository.existsByUserIdAndBookId(userId, bookId);

        if (exists) {
            wishlistRepository.deleteByUserIdAndBookId(userId, bookId);
            return WishlistToggleResponse.builder().status("removed").build();
        } else {
            addToWishlist(new WishlistRequest(bookId));
            return WishlistToggleResponse.builder().status("added").build();
        }
    }

    @Override
    @Transactional(readOnly = true) // 🔥 THÊM Ở ĐÂY
    public List<WishlistResponse> getMyWishlist(String keyword, String sortBy) {
        List<WishlistEntity> entities = wishlistRepository.searchAndSortWishlist(getCurrentUserId(), keyword, Sort.by("createdAt").descending());

        List<WishlistResponse> responses = entities.stream()
                .map(this::mapToResponseWithDiscount) // 🔥 SỬA Ở ĐÂY
                .collect(Collectors.toList());

        if ("price-asc".equals(sortBy)) {
            responses.sort(Comparator.comparing(WishlistResponse::getSalePrice));
        } else if ("price-desc".equals(sortBy)) {
            responses.sort(Comparator.comparing(WishlistResponse::getSalePrice).reversed());
        }

        return responses;
    }
}