package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.cart.CartItemRequest;
import com.haui.ZenBook.dto.cart.CartResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.CartDetailEntity;
import com.haui.ZenBook.entity.CartEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.CartMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.CartDetailRepository;
import com.haui.ZenBook.repository.CartRepository;
import com.haui.ZenBook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CartMapper cartMapper;

    // 👉 Tiêm thêm PromotionService để check giá
    private final PromotionService promotionService;

    private CartEntity getOrCreateCart(String email) {
        return cartRepository.findByUserEmail(email).orElseGet(() -> {
            UserEntity user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            CartEntity newCart = CartEntity.builder()
                    .user(user)
                    .build();
            return cartRepository.save(newCart);
        });
    }

    /**
     * 👉 HÀM QUAN TRỌNG: Tính lại giá cho từng sản phẩm và tổng tiền giỏ hàng
     */
    private CartResponse buildCartResponse(CartEntity cart) {
        CartResponse response = cartMapper.toCartResponse(cart);
        double grandTotal = 0;

        // 1. Kiểm tra danh sách details trong response trả về
        if (response.getDetails() != null && !cart.getDetails().isEmpty()) {
            for (int i = 0; i < cart.getDetails().size(); i++) {
                // Lấy Entity tương ứng
                var entity = cart.getDetails().get(i);

                // 👉 Lấy DTO tương ứng (Thay 'CartDetailResponse' bằng tên class của bạn)
                var itemDto = response.getDetails().get(i);

                // 2. Tính giá khuyến mãi thực tế cho cuốn sách này
                double promoPrice = promotionService.getPromotionalPrice(entity.getBook());

                // 3. Nếu có khuyến mãi thì dùng giá đó, không thì dùng salePrice trong DB
                double currentPrice = (promoPrice > 0) ? promoPrice : entity.getBook().getSalePrice();

                // 4. Ghi đè lại giá vào DTO để Frontend hiển thị đúng
                itemDto.setPrice(currentPrice);

                // 5. Cộng dồn vào tổng tiền giỏ hàng
                grandTotal += currentPrice * itemDto.getQuantity();
            }
        }

        // 6. Cập nhật lại tổng tiền cuối cùng của giỏ hàng
        response.setTotalPrice(grandTotal);
        return response;
    }

    @Override
    public CartResponse getCart(String userId) {
        CartEntity cart = getOrCreateCart(userId);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String userId, CartItemRequest request) {
        CartEntity cart = getOrCreateCart(userId);
        BookEntity book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        Optional<CartDetailEntity> existingDetail = cartDetailRepository.findByCartIdAndBookId(cart.getId(), book.getId());

        if (existingDetail.isPresent()) {
            CartDetailEntity detail = existingDetail.get();
            int newQuantity = detail.getQuantity() + request.getQuantity();

            if (newQuantity > book.getStockQuantity()) {
                throw new AppException(ErrorCode.BOOK_STOCK_INVALID);
            }
            detail.setQuantity(newQuantity);
            cartDetailRepository.save(detail);
        } else {
            if (request.getQuantity() > book.getStockQuantity()) {
                throw new AppException(ErrorCode.BOOK_STOCK_INVALID);
            }
            CartDetailEntity newDetail = CartDetailEntity.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
            cartDetailRepository.save(newDetail);
            cart.getDetails().add(newDetail);
        }

        return buildCartResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userId, String bookId, Integer quantity) {
        CartEntity cart = getOrCreateCart(userId);
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        CartDetailEntity detail = cartDetailRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND_IN_CART));

        if (quantity > book.getStockQuantity()) {
            throw new AppException(ErrorCode.BOOK_STOCK_INVALID);
        }

        detail.setQuantity(quantity);
        cartDetailRepository.save(detail);

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String userId, String bookId) {
        CartEntity cart = getOrCreateCart(userId);
        CartDetailEntity detail = cartDetailRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND_IN_CART));

        cart.getDetails().remove(detail);
        cartDetailRepository.delete(detail);

        return buildCartResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeMultipleCartItems(String userId, List<String> bookIds) {
        CartEntity cart = getOrCreateCart(userId);

        List<CartDetailEntity> detailsToRemove = cart.getDetails().stream()
                .filter(detail -> bookIds.contains(detail.getBook().getId()))
                .toList();

        cart.getDetails().removeAll(detailsToRemove);
        cartDetailRepository.deleteAll(detailsToRemove);

        return buildCartResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(String userId) {
        CartEntity cart = getOrCreateCart(userId);
        cartDetailRepository.deleteAll(cart.getDetails());
        cart.getDetails().clear();
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void removeItemsByBookIds(String userId, List<String> bookIds) {
        CartEntity cart = getOrCreateCart(userId);

        List<CartDetailEntity> itemsToRemove = cart.getDetails().stream()
                .filter(detail -> bookIds.contains(detail.getBook().getId()))
                .collect(Collectors.toList());

        if (!itemsToRemove.isEmpty()) {
            cartDetailRepository.deleteAll(itemsToRemove);
            cart.getDetails().removeAll(itemsToRemove);
            cartRepository.save(cart);
        }
    }

    @Override
    @Transactional
    public CartResponse syncCart(String userId, List<CartItemRequest> localItems) {
        CartEntity cart = getOrCreateCart(userId);

        for (CartItemRequest localItem : localItems) {
            BookEntity book = bookRepository.findById(localItem.getBookId()).orElse(null);

            if (book == null || book.getStockQuantity() == 0) continue;

            Optional<CartDetailEntity> existingDetail = cartDetailRepository.findByCartIdAndBookId(cart.getId(), book.getId());

            if (existingDetail.isPresent()) {
                CartDetailEntity detail = existingDetail.get();
                int newQuantity = detail.getQuantity() + localItem.getQuantity();
                detail.setQuantity(Math.min(newQuantity, book.getStockQuantity()));
                cartDetailRepository.save(detail);
            } else {
                int quantity = Math.min(localItem.getQuantity(), book.getStockQuantity());
                CartDetailEntity newDetail = CartDetailEntity.builder()
                        .cart(cart)
                        .book(book)
                        .quantity(quantity)
                        .build();
                cartDetailRepository.save(newDetail);
                cart.getDetails().add(newDetail);
            }
        }

        return buildCartResponse(cartRepository.save(cart));
    }
}