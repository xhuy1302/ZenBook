package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.AuthorEntity; // 👉 Thêm Import
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PublisherEntity; // 👉 Thêm Import
import com.haui.ZenBook.enums.BookStatus;
import jakarta.persistence.criteria.Join; // 👉 Thêm Import
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BookSpecification {

    public static Specification<BookEntity> filterBooks(
            String keyword, BigDecimal minPrice, BigDecimal maxPrice, List<String> categoryIds) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Chỉ lấy sách đang ACTIVE và chưa bị xóa mềm
            predicates.add(criteriaBuilder.equal(root.get("status"), BookStatus.ACTIVE));
            predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));

            // =========================================================
            // 2. LỌC THEO TỪ KHÓA ĐA LUỒNG (ĐÃ NÂNG CẤP)
            // =========================================================
            if (keyword != null && !keyword.isBlank()) {
                String likeKeyword = "%" + keyword.toLowerCase().trim() + "%";

                // Tạo cầu nối (JOIN) sang bảng Tác giả và NXB
                Join<BookEntity, AuthorEntity> authorJoin = root.join("authors", JoinType.LEFT);
                Join<BookEntity, PublisherEntity> publisherJoin = root.join("publisher", JoinType.LEFT);

                // Tìm kiếm trên 4 cột khác nhau
                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword);
                Predicate isbnMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("isbn")), likeKeyword);
                Predicate authorMatch = criteriaBuilder.like(criteriaBuilder.lower(authorJoin.get("name")), likeKeyword);
                Predicate publisherMatch = criteriaBuilder.like(criteriaBuilder.lower(publisherJoin.get("name")), likeKeyword);

                // Gom 4 điều kiện bằng phép OR (Chỉ cần thỏa mãn 1 trong 4 là được)
                predicates.add(criteriaBuilder.or(titleMatch, isbnMatch, authorMatch, publisherMatch));
            }

            // 3. Lọc theo giá tối thiểu
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("salePrice"), minPrice));
            }

            // 4. Lọc theo giá tối đa
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("salePrice"), maxPrice));
            }

            // 5. Lọc theo Category
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.join("categories", JoinType.INNER).get("id").in(categoryIds));
            }

            // Chống trùng lặp dữ liệu (Duplicate) khi Join với nhiều bảng
            query.distinct(true);

            // Gộp tất cả các điều kiện lại bằng phép AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}