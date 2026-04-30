package com.haui.ZenBook.dto.wishlist;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WishlistToggleResponse {
    private String status; // "added" hoặc "removed"
}