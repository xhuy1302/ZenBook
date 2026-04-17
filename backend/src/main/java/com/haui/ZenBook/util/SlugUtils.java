package com.haui.ZenBook.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtils {
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String makeSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        // 1. Thay thế thủ công chữ đ và Đ (Vì NFD không xử lý được 2 chữ này)
        String slug = input.replace('đ', 'd').replace('Đ', 'D');

        // 2. Chuyển sang chữ thường và thay thế khoảng trắng bằng gạch ngang
        slug = WHITESPACE.matcher(slug).replaceAll("-");

        // 3. Loại bỏ các dấu tiếng Việt khác (á, à, ả,...)
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);

        // 4. Xóa tất cả các ký tự không phải Latinh hoặc số
        slug = NONLATIN.matcher(slug).replaceAll("");

        // 5. Dọn dẹp các gạch ngang thừa
        return slug.toLowerCase(Locale.ENGLISH)
                .replaceAll("-+", "-")      // Nhiều gạch ngang thành 1
                .replaceAll("^-", "")       // Xóa gạch ngang ở đầu
                .replaceAll("-$", "");      // Xóa gạch ngang ở cuối
    }
}