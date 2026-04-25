package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.author.AuthorFilterResponse;
import com.haui.ZenBook.dto.cart.CartItemRequest;
import com.haui.ZenBook.dto.cart.CartResponse;
import com.haui.ZenBook.dto.category.CategoryFilterResponse;

import java.util.List;

public interface CartService {
    // 1. Lấy giỏ hàng của user hiện tại
    CartResponse getCart(String userId);

    // 2. Thêm 1 sản phẩm vào giỏ
    CartResponse addToCart(String userId, CartItemRequest request);

    // 3. Cập nhật số lượng của 1 sản phẩm
    CartResponse updateCartItem(String userId, String bookId, Integer quantity);

    // 4. Xóa 1 sản phẩm khỏi giỏ
    CartResponse removeCartItem(String userId, String bookId);

    // 5. Xóa nhiều sản phẩm cùng lúc
    CartResponse removeMultipleCartItems(String userId, List<String> bookIds);

    // 6. Xóa sạch giỏ hàng (Dùng sau khi thanh toán)
    void clearCart(String userId);

    // 7. Đồng bộ giỏ hàng từ LocalStorage lên Database khi đăng nhập
    CartResponse syncCart(String userId, List<CartItemRequest> localItems);

    void removeItemsByBookIds(String userId, List<String> bookIds);


}