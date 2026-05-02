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
import org.springframework.cache.annotation.CacheEvict; // 👉 Import quan trọng
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
    private final PromotionService promotionService;

    // 👉 Helper: Lấy User ID (Chuyển sang public để SpEL truy cập được)
    public String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"))
                .getId();
    }

    private UserEntity getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private WishlistResponse mapToResponseWithDiscount(WishlistEntity wishlist) {
        if (wishlist == null || wishlist.getBook() == null) return null;
        WishlistResponse response = wishlistMapper.toResponse(wishlist);
        BookEntity book = wishlist.getBook();
        double promoPrice = promotionService.getPromotionalPrice(book);
        if (promoPrice > 0) {
            response.setSalePrice(promoPrice);
            if (response.getOriginalPrice() != null && response.getOriginalPrice() > 0) {
                response.setDiscount((int) Math.round((1 - (promoPrice / response.getOriginalPrice())) * 100));
            }
        } else {
            response.setSalePrice(response.getOriginalPrice());
            response.setDiscount(0);
        }
        return response;
    }

    @Override
    @Transactional
    // 👉 Sửa lỗi SpEL: Gọi method bean để lấy ID từ SecurityContext
    @CacheEvict(value = "bookRecommendations", key = "@wishlistServiceImpl.getCurrentUserId()")
    public void addToWishlist(WishlistRequest request) {
        UserEntity user = getCurrentUser();
        if (wishlistRepository.existsByUserIdAndBookId(user.getId(), request.getBookId())) return;
        BookEntity book = bookRepository.findById(request.getBookId()).orElseThrow(() -> new EntityNotFoundException("Book not found"));
        wishlistRepository.save(WishlistEntity.builder().user(user).book(book).build());
    }

    @Override
    @Transactional
    // 👉 Thêm: Xóa cache khi xóa khỏi yêu thích
    @CacheEvict(value = "bookRecommendations", key = "@wishlistServiceImpl.getCurrentUserId()")
    public void removeFromWishlist(String bookId) {
        wishlistRepository.deleteByUserIdAndBookId(getCurrentUserId(), bookId);
    }

    @Override
    @Transactional
    // 👉 Thêm: Xóa cache khi toggle
    @CacheEvict(value = "bookRecommendations", key = "@wishlistServiceImpl.getCurrentUserId()")
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
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist() {
        return wishlistRepository.findAllByUserIdWithBook(getCurrentUserId()).stream().map(this::mapToResponseWithDiscount).collect(Collectors.toList());
    }

    @Override
    public WishlistCheckResponse checkInWishlist(String bookId) {
        return WishlistCheckResponse.builder().inWishlist(wishlistRepository.existsByUserIdAndBookId(getCurrentUserId(), bookId)).build();
    }

    @Override
    public WishlistCountResponse countMyWishlist() {
        return WishlistCountResponse.builder().count(wishlistRepository.countByUserId(getCurrentUserId())).build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(String keyword, String sortBy) {
        List<WishlistResponse> responses = wishlistRepository.searchAndSortWishlist(getCurrentUserId(), keyword, Sort.by("createdAt").descending()).stream().map(this::mapToResponseWithDiscount).collect(Collectors.toList());
        if ("price-asc".equals(sortBy)) responses.sort(Comparator.comparing(WishlistResponse::getSalePrice));
        else if ("price-desc".equals(sortBy)) responses.sort(Comparator.comparing(WishlistResponse::getSalePrice).reversed());
        return responses;
    }
}