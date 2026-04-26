package com.haui.ZenBook.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtils {

    private static final Pattern COMBINING_MARKS =
            Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private static final Pattern NONLATIN =
            Pattern.compile("[^a-z0-9\\s-]");

    private static final Pattern WHITESPACE =
            Pattern.compile("\\s+");

    public static String makeSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String slug = input.trim();

        // fix riêng chữ Đ/đ
        slug = slug.replace("đ", "d")
                .replace("Đ", "D");

        // bỏ dấu
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = COMBINING_MARKS.matcher(slug).replaceAll("");

        // lowercase
        slug = slug.toLowerCase(Locale.ENGLISH);

        // remove ký tự đặc biệt
        slug = NONLATIN.matcher(slug).replaceAll("");

        // khoảng trắng -> -
        slug = WHITESPACE.matcher(slug).replaceAll("-");

        // dọn --
        slug = slug.replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return slug;
    }
}