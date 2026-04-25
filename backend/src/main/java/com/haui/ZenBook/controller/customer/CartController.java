package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.ApiResponse;
import com.haui.ZenBook.dto.cart.CartItemRequest;
import com.haui.ZenBook.dto.cart.CartResponse;
import com.haui.ZenBook.service.CartService;
import com.haui.ZenBook.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final MessageUtil messageUtil;

    // 1. Lấy thông tin giỏ hàng hiện tại
    @GetMapping
    public ApiResponse<CartResponse> getMyCart(Principal principal) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.getCart(principal.getName()))
                .build();
    }

    // 2. Thêm một sản phẩm vào giỏ (Nút "Thêm vào giỏ" ở trang chi tiết sách)
    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(
            Principal principal,
            @Valid @RequestBody CartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.addToCart(principal.getName(), request))
                .message(messageUtil.getMessage("cart.add.success"))
                .build();
    }

    // 3. Cập nhật số lượng của một sản phẩm (Nút [+], [-] hoặc gõ số)
    @PutMapping("/items/{bookId}")
    public ApiResponse<CartResponse> updateQuantity(
            Principal principal,
            @PathVariable String bookId,
            @RequestBody Map<String, Integer> body) {
        // Có thể dùng một DTO riêng, ở đây dùng Map cho nhanh lấy trường "quantity"
        Integer quantity = body.get("quantity");
        if (quantity == null || quantity < 1) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        return ApiResponse.<CartResponse>builder()
                .data(cartService.updateCartItem(principal.getName(), bookId, quantity))
                .build(); // Cập nhật số lượng thường không cần hiện message popup liên tục
    }

    // 4. Xóa 1 sản phẩm khỏi giỏ (Nút thùng rác)
    @DeleteMapping("/items/{bookId}")
    public ApiResponse<CartResponse> removeItem(
            Principal principal,
            @PathVariable String bookId) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.removeCartItem(principal.getName(), bookId))
                .message(messageUtil.getMessage("cart.remove.success"))
                .build();
    }

    // 5. Xóa nhiều sản phẩm cùng lúc (Nút "Xóa đã chọn" ở Header Giỏ hàng)
    @DeleteMapping("/items/bulk")
    public ApiResponse<CartResponse> removeMultipleItems(
            Principal principal,
            @RequestBody Map<String, List<String>> body) {
        List<String> bookIds = body.get("bookIds");
        return ApiResponse.<CartResponse>builder()
                .data(cartService.removeMultipleCartItems(principal.getName(), bookIds))
                .message(messageUtil.getMessage("cart.remove.success"))
                .build();
    }

    // 6. Xóa sạch giỏ hàng (Sau khi checkout hoặc ấn nút clear toàn bộ)
    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart(Principal principal) {
        cartService.clearCart(principal.getName());
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("cart.clear.success"))
                .build();
    }

    // 7. Đồng bộ giỏ hàng từ LocalStorage khi Đăng nhập
    @PostMapping("/sync")
    public ApiResponse<CartResponse> syncCart(
            Principal principal,
            @RequestBody List<CartItemRequest> localItems) {
        return ApiResponse.<CartResponse>builder()
                .data(cartService.syncCart(principal.getName(), localItems))
                // Không cần hiện message, xử lý ngầm ở Frontend
                .build();
    }
}