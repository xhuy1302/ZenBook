package com.haui.ZenBook.dto.wishlist;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor // Tạo constructor rỗng cho Spring boot dùng
@AllArgsConstructor
public class WishlistRequest {
    private String bookId;
}