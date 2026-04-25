package com.haui.ZenBook.repository;

import com.haui.ZenBook.entity.AuthorEntity;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.PublisherEntity;
import com.haui.ZenBook.enums.BookStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class BookSpecification {

    public static Specification<BookEntity> filterBooks(
            String keyword, BigDecimal minPrice, BigDecimal maxPrice,
            List<String> categoryIds, List<String> authorIds, List<String> publisherIds,
            List<String> formats, List<String> languages, Integer minRating) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("status"), BookStatus.ACTIVE));
            predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));

            if (keyword != null && !keyword.isBlank()) {
                String likeKeyword = "%" + keyword.toLowerCase().trim() + "%";
                Join<BookEntity, AuthorEntity> authorJoin = root.join("authors", JoinType.LEFT);
                Join<BookEntity, PublisherEntity> publisherJoin = root.join("publisher", JoinType.LEFT);

                Predicate titleMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword);
                Predicate isbnMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("isbn")), likeKeyword);
                Predicate authorMatch = criteriaBuilder.like(criteriaBuilder.lower(authorJoin.get("name")), likeKeyword);
                Predicate publisherMatch = criteriaBuilder.like(criteriaBuilder.lower(publisherJoin.get("name")), likeKeyword);

                predicates.add(criteriaBuilder.or(titleMatch, isbnMatch, authorMatch, publisherMatch));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("salePrice"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("salePrice"), maxPrice));
            }

            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.join("categories", JoinType.INNER).get("id").in(categoryIds));
            }

            if (authorIds != null && !authorIds.isEmpty()) {
                predicates.add(root.join("authors", JoinType.INNER).get("id").in(authorIds));
            }

            if (publisherIds != null && !publisherIds.isEmpty()) {
                predicates.add(root.get("publisher").get("id").in(publisherIds));
            }

            if (formats != null && !formats.isEmpty()) {
                predicates.add(root.get("format").in(formats));
            }

            if (languages != null && !languages.isEmpty()) {
                predicates.add(root.get("language").in(languages));
            }

            if (minRating != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            query.distinct(true);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}