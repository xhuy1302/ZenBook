package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.wishlist.*;
import java.util.List;

public interface WishlistService {
    void addToWishlist(WishlistRequest request);
    void removeFromWishlist(String bookId);
    List<WishlistResponse> getMyWishlist();
    WishlistCheckResponse checkInWishlist(String bookId);
    WishlistCountResponse countMyWishlist();
    WishlistToggleResponse toggleWishlist(String bookId);
    List<WishlistResponse> getMyWishlist(String keyword, String sortBy);
}