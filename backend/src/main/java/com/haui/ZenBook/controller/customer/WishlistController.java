package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.wishlist.*;
import com.haui.ZenBook.service.WishlistService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final MessageUtil messageUtil;

    @PostMapping
    public ApiResponse<Void> addToWishlist(@Valid @RequestBody WishlistRequest request) {
        wishlistService.addToWishlist(request);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @DeleteMapping("/{bookId}")
    public ApiResponse<Void> removeFromWishlist(@PathVariable("bookId") String bookId) {
        wishlistService.removeFromWishlist(bookId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    // 👉 Đã gộp thành 1 hàm GET duy nhất cho danh sách
    @GetMapping
    public ApiResponse<List<WishlistResponse>> getMyWishlist(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {
        return ApiResponse.<List<WishlistResponse>>builder()
                .data(wishlistService.getMyWishlist(keyword, sortBy))
                .build();
    }

    @GetMapping("/check/{bookId}")
    public ApiResponse<WishlistCheckResponse> checkInWishlist(@PathVariable("bookId") String bookId) {
        return ApiResponse.<WishlistCheckResponse>builder()
                .data(wishlistService.checkInWishlist(bookId))
                .build();
    }

    @GetMapping("/count")
    public ApiResponse<WishlistCountResponse> countMyWishlist() {
        return ApiResponse.<WishlistCountResponse>builder()
                .data(wishlistService.countMyWishlist())
                .build();
    }

    @PostMapping("/toggle/{bookId}")
    public ApiResponse<WishlistToggleResponse> toggleWishlist(@PathVariable("bookId") String bookId) {
        WishlistToggleResponse result = wishlistService.toggleWishlist(bookId);
        String messageKey = result.getStatus().equals("added") ? "created.success" : "deleted.success";

        return ApiResponse.<WishlistToggleResponse>builder()
                .data(result)
                .message(messageUtil.getMessage(messageKey))
                .build();
    }
}