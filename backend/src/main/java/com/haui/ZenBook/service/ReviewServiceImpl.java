package com.haui.ZenBook.service;

import com.haui.ZenBook.dto.review.ReviewFilterRequest;
import com.haui.ZenBook.dto.review.ReviewReplyRequest;
import com.haui.ZenBook.dto.review.UpdateReviewStatusRequest;
import com.haui.ZenBook.dto.review.ReviewDetailResponse;
import com.haui.ZenBook.dto.review.ReviewReplyResponse;
import com.haui.ZenBook.dto.review.ReviewSummaryResponse;
import com.haui.ZenBook.entity.BookEntity;
import com.haui.ZenBook.entity.ReviewEntity;
import com.haui.ZenBook.entity.ReviewReplyEntity;
import com.haui.ZenBook.entity.UserEntity;
import com.haui.ZenBook.enums.ReviewStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ReviewMapper;
import com.haui.ZenBook.repository.BookRepository;
import com.haui.ZenBook.repository.ReviewReplyRepository;
import com.haui.ZenBook.repository.ReviewRepository;
import com.haui.ZenBook.repository.UserRepository;
import com.haui.ZenBook.service.ReviewService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    // ==========================================
    // 1. LẤY DANH SÁCH (CÓ BỘ LỌC ĐỘNG)
    // ==========================================
    @Override
    public Page<ReviewSummaryResponse> getAdminReviews(ReviewFilterRequest filter, Pageable pageable) {
        Specification<ReviewEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));

            if (filter.getBookId() != null && !filter.getBookId().isEmpty()) {
                predicates.add(cb.equal(root.get("book").get("id"), filter.getBookId()));
            }
            if (filter.getRating() != null) {
                predicates.add(cb.equal(root.get("rating"), filter.getRating()));
            }
            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate().atStartOfDay()));
            }
            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate().atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ReviewEntity> reviewsPage = reviewRepository.findAll(spec, pageable);
        return reviewsPage.map(reviewMapper::toSummaryResponse);
    }

    // ==========================================
    // 2. XEM CHI TIẾT
    // ==========================================
    @Override
    public ReviewDetailResponse getReviewDetail(String reviewId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND)); // Đã sửa sang AppException

        return reviewMapper.toDetailResponse(review);
    }

    // ==========================================
    // 3. CẬP NHẬT TRẠNG THÁI (DUYỆT / ẨN)
    // ==========================================
    @Override
    @Transactional
    public ReviewDetailResponse updateReviewStatus(String reviewId, UpdateReviewStatusRequest request) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        ReviewStatus oldStatus = review.getStatus();
        review.setStatus(request.getStatus());
        reviewRepository.save(review);

        // Nếu trạng thái thay đổi liên quan đến APPROVED, tính lại điểm trung bình
        if (oldStatus != request.getStatus() &&
                (oldStatus == ReviewStatus.APPROVED || request.getStatus() == ReviewStatus.APPROVED)) {
            recalculateBookRating(review.getBook().getId());
        }

        return reviewMapper.toDetailResponse(review);
    }

    // ==========================================
    // 4. ADMIN TRẢ LỜI ĐÁNH GIÁ
    // ==========================================
    @Override
    @Transactional
    public ReviewReplyResponse replyToReview(String reviewId, ReviewReplyRequest request, String staffUserId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        if (review.getReply() != null) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_REPLIED); // Đã sửa sang AppException
        }

        UserEntity staffUser = userRepository.findById(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)); // Tận dụng lỗi User có sẵn

        ReviewReplyEntity reply = ReviewReplyEntity.builder()
                .id(UUID.randomUUID().toString())
                .review(review)
                .user(staffUser)
                .content(request.getContent())
                .build();

        review.setReplySide(reply);
        reviewReplyRepository.save(reply);

        return reviewMapper.toReplyResponse(reply);
    }

    // ==========================================
    // 5. SỬA CÂU TRẢ LỜI
    // ==========================================
    @Override
    @Transactional
    public ReviewReplyResponse updateReply(String replyId, ReviewReplyRequest request) {
        ReviewReplyEntity reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_REPLY_NOT_FOUND)); // Đã sửa sang AppException

        reply.setContent(request.getContent());
        reviewReplyRepository.save(reply);

        return reviewMapper.toReplyResponse(reply);
    }

    // ==========================================
    // 6. XÓA CÂU TRẢ LỜI
    // ==========================================
    @Override
    @Transactional
    public void deleteReply(String replyId) {
        ReviewReplyEntity reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_REPLY_NOT_FOUND));

        if (reply.getReview() != null) {
            reply.getReview().setReplySide(null);
        }

        reviewReplyRepository.delete(reply);
    }

    // ==========================================
    // HELPER: TÍNH LẠI TRUNG BÌNH SỐ SAO CỦA SÁCH
    // ==========================================
    private void recalculateBookRating(String bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND)); // Tận dụng lỗi Book có sẵn

        List<ReviewEntity> approvedReviews = reviewRepository.findAll(
                (root, query, cb) -> cb.and(
                        cb.equal(root.get("book").get("id"), bookId),
                        cb.equal(root.get("status"), ReviewStatus.APPROVED),
                        cb.isNull(root.get("deletedAt"))
                )
        );

        int totalReviews = approvedReviews.size();
        double averageRating = 0.0;

        if (totalReviews > 0) {
            double sum = approvedReviews.stream().mapToDouble(ReviewEntity::getRating).sum();
            averageRating = Math.round((sum / totalReviews) * 10.0) / 10.0;
        }

        book.setTotalReviews(totalReviews);
        book.setRating(averageRating);
        bookRepository.save(book);
    }
}