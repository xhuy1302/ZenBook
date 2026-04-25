package com.haui.ZenBook.shipping;

import com.haui.ZenBook.dto.order.OrderItemRequest;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.haui.ZenBook.repository.BookRepository;

@Service
@RequiredArgsConstructor
public class ShippingCalculator {
    private final BookRepository bookRepository;
    private final PromotionService promotionService;

    public Map<String, BookEntity> getBooksForOrder(List<OrderItemRequest> items) {
        List<String> bookIds = items.stream().map(OrderItemRequest::getBookId).collect(Collectors.toList());
        return bookRepository.findAllById(bookIds).stream()
                .collect(Collectors.toMap(BookEntity::getId, book -> book));
    }

    public double calculateTotalWeight(List<OrderItemRequest> items, Map<String, BookEntity> bookMap) {
        int totalGram = 0;
        for (OrderItemRequest item : items) {
            BookEntity book = bookMap.get(item.getBookId());
            // Lấy trực tiếp số gram từ DB (Ví dụ: 300)
            int weight = (book != null && book.getSpecification() != null && book.getSpecification().getWeight() != null)
                    ? book.getSpecification().getWeight()
                    : 400; // Mặc định 400g nếu chưa nhập
            totalGram += weight * item.getQuantity();
        }
        return totalGram / 1000.0; // Trả về Kg (Ví dụ: 0.3kg)
    }

    public double calculateOrderTotal(List<OrderItemRequest> items, Map<String, BookEntity> bookMap) {
        double total = 0;
        for (OrderItemRequest item : items) {
            BookEntity book = bookMap.get(item.getBookId());
            if (book != null) {
                double promoPrice = promotionService.getPromotionalPrice(book);
                double actualPrice = (promoPrice > 0) ? promoPrice : book.getSalePrice();
                total += actualPrice * item.getQuantity();
            }
        }
        return total;
    }
}