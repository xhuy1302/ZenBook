package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.review.*;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.ReviewStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ReviewMapper;
import com.haui.ZenBook.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 👉 Thêm log để dễ debug
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;
    private final OrderDetailRepository orderDetailRepository;
    private final ReviewHelpfulVoteRepository helpfulVoteRepository;
    private final S3Service s3Service;

    // 👉 THÊM MỚI: Inject MembershipService để xử lý thưởng điểm
    private final MembershipService membershipService;

    // ... (Các hàm getAdminReviews, getReviewDetail, updateReviewStatus giữ nguyên) ...

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

    @Override
    public ReviewDetailResponse getReviewDetail(String reviewId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return reviewMapper.toDetailResponse(review);
    }

    @Override
    @Transactional
    public ReviewDetailResponse updateReviewStatus(String reviewId, UpdateReviewStatusRequest request) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        ReviewStatus oldStatus = review.getStatus();
        review.setStatus(request.getStatus());
        reviewRepository.save(review);
        if (oldStatus != request.getStatus() && (oldStatus == ReviewStatus.APPROVED || request.getStatus() == ReviewStatus.APPROVED)) {
            recalculateBookRating(review.getBook().getId());
        }
        return reviewMapper.toDetailResponse(review);
    }

    @Override
    @Transactional
    public ReviewReplyResponse replyToReview(String reviewId, ReviewReplyRequest request, String staffUserId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        if (review.getReply() != null) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_REPLIED);
        }
        UserEntity staffUser = userRepository.findById(staffUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ReviewReplyEntity reply = ReviewReplyEntity.builder()
                .id(UUID.randomUUID().toString())
                .review(review)
                .user(staffUser)
                .content(request.getContent())
                .build();
        review.setReplySide(reply);
        return reviewMapper.toReplyResponse(reply);
    }

    @Override
    @Transactional
    public ReviewReplyResponse updateReply(String replyId, ReviewReplyRequest request) {
        ReviewReplyEntity reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_REPLY_NOT_FOUND));
        reply.setContent(request.getContent());
        reviewReplyRepository.save(reply);
        return reviewMapper.toReplyResponse(reply);
    }

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

    private void recalculateBookRating(String bookId) {
        BookEntity book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        List<ReviewEntity> approvedReviews = reviewRepository.findAll((root, query, cb) -> cb.and(
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

    @Override
    public Page<ReviewResponse> getBookReviews(String bookId, ReviewCustomerFilter filter, Pageable pageable, String currentUserId) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND, bookId);
        }
        Pageable unsortedPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Specification<ReviewEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("book").get("id"), bookId));
            predicates.add(cb.equal(root.get("status"), ReviewStatus.APPROVED));
            predicates.add(cb.isNull(root.get("deletedAt")));
            if (filter != null) {
                if (filter.getRating() != null) {
                    predicates.add(cb.equal(root.get("rating"), filter.getRating()));
                }
                if (Boolean.TRUE.equals(filter.getHasImage())) {
                    predicates.add(cb.isNotEmpty(root.get("images")));
                }
                if ("helpful".equalsIgnoreCase(filter.getSortBy())) {
                    query.orderBy(cb.desc(cb.size(root.get("helpfulVotes"))), cb.desc(root.get("createdAt")));
                } else {
                    query.orderBy(cb.desc(root.get("createdAt")));
                }
            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<ReviewEntity> reviews = reviewRepository.findAll(spec, unsortedPageable);
        return reviews.map(entity -> {
            ReviewResponse res = ReviewResponse.builder()
                    .id(entity.getId())
                    .userId(entity.getUser().getId())
                    .userName(entity.getUser().getFullName() != null ? entity.getUser().getFullName() : entity.getUser().getUsername())
                    .userAvatar(entity.getUser().getAvatar())
                    .rating(entity.getRating())
                    .content(entity.getContent())
                    .createdAt(entity.getCreatedAt())
                    .helpfulVotes(entity.getHelpfulVotes() != null ? entity.getHelpfulVotes().size() : 0)
                    .build();
            if (entity.getImages() != null) {
                res.setImages(entity.getImages().stream().map(img -> {
                    ReviewImageResponse imgRes = new ReviewImageResponse();
                    imgRes.setId(img.getId());
                    imgRes.setImageUrl(img.getImageUrl());
                    return imgRes;
                }).collect(Collectors.toList()));
            } else {
                res.setImages(new ArrayList<>());
            }
            if (entity.getReply() != null) {
                ReviewReplyResponse replyRes = ReviewReplyResponse.builder()
                        .id(entity.getReply().getId())
                        .reviewId(entity.getId())
                        .content(entity.getReply().getContent())
                        .createdAt(entity.getReply().getCreatedAt())
                        .updatedAt(entity.getReply().getUpdatedAt())
                        .repliedById(entity.getReply().getUser().getId())
                        .repliedByFullName(entity.getReply().getUser().getFullName() != null ? entity.getReply().getUser().getFullName() : entity.getReply().getUser().getUsername())
                        .build();
                res.setReply(replyRes);
            }
            if (currentUserId != null) {
                boolean isHelpful = helpfulVoteRepository.findByReviewIdAndUserId(entity.getId(), currentUserId).isPresent();
                res.setHelpfulByMe(isHelpful);
            } else {
                res.setHelpfulByMe(false);
            }
            return res;
        });
    }

    // ==========================================
    // 🎯 HÀM CẬP NHẬT: TÍCH HỢP CỘNG ĐIỂM THƯỞNG
    // ==========================================
    @Override
    @Transactional
    public ReviewDetailResponse createReview(String bookId, CreateReviewRequest request, String userId) {
        // 1. Kiểm tra tồn tại
        if (reviewRepository.existsByOrderDetailIdAndDeletedAtIsNull(request.getOrderDetailId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        OrderDetailEntity orderDetail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tạo Entity
        ReviewEntity review = ReviewEntity.builder()
                .id(UUID.randomUUID().toString())
                .orderDetail(orderDetail)
                .book(orderDetail.getBook())
                .user(user)
                .rating(request.getRating())
                .content(request.getContent())
                .status(ReviewStatus.PENDING)
                .isVerifiedPurchase(true)
                .build();

        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                ReviewImageEntity image = ReviewImageEntity.builder()
                        .id(UUID.randomUUID().toString())
                        .imageUrl(url)
                        .build();
                review.addImage(image);
            }
        }

        // 3. Lưu Review
        ReviewEntity savedReview = reviewRepository.save(review);

        // 4. 👉 LOGIC TÍNH ĐIỂM THƯỞNG
        int bonusPoints = 0;

        // Quy tắc 1: Review có chữ (+20)
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            bonusPoints += 20;
        }

        // Quy tắc 2: Review có hình ảnh (+50)
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            bonusPoints += 50;
        }

        // Quy tắc 3: Verified purchase (+30) - Ở đây mặc định true vì review qua orderDetailId
        bonusPoints += 30;

        // Gọi trạm cộng điểm (Tự động nhân đôi nếu là sinh nhật khách)
        if (bonusPoints > 0) {
            membershipService.addBonusPoints(
                    userId,
                    bonusPoints,
                    "Thưởng đánh giá sản phẩm: " + orderDetail.getBook().getTitle(),
                    savedReview.getId()
            );
        }

        return reviewMapper.toDetailResponse(savedReview);
    }

    @Override
    @Transactional
    public ReviewDetailResponse updateReview(String reviewId, UpdateReviewRequest request, String userId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (review.getCreatedAt().plusDays(30).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_DATA);
        }
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setStatus(ReviewStatus.PENDING);
        return reviewMapper.toDetailResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteReview(String reviewId, String userId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        review.setDeletedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    @Override
    @Transactional
    public HelpfulVoteResponse toggleHelpfulVote(String reviewId, String userId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        Optional<ReviewHelpfulVoteEntity> existingVote = helpfulVoteRepository.findByReviewIdAndUserId(reviewId, userId);
        if (existingVote.isPresent()) {
            helpfulVoteRepository.delete(existingVote.get());
        } else {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, userId));
            ReviewHelpfulVoteEntity vote = ReviewHelpfulVoteEntity.builder()
                    .id(UUID.randomUUID().toString())
                    .review(review)
                    .user(user)
                    .build();
            helpfulVoteRepository.save(vote);
        }
        long newCount = helpfulVoteRepository.countByReviewId(reviewId);
        boolean isHelpful = helpfulVoteRepository.findByReviewIdAndUserId(reviewId, userId).isPresent();
        return HelpfulVoteResponse.builder().helpfulVotes(newCount).isHelpful(isHelpful).build();
    }

    @Override
    public String uploadReviewImage(MultipartFile file) {
        try {
            return s3Service.uploadFile(file, "reviews");
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }

    @Override
    public RatingStatsResponse getRatingStats(String bookId) {
        List<ReviewEntity> approved = reviewRepository.findByBookIdAndStatusAndDeletedAtIsNull(bookId, ReviewStatus.APPROVED);
        Map<Integer, Long> breakdown = approved.stream().collect(Collectors.groupingBy(ReviewEntity::getRating, Collectors.counting()));
        for (int i = 1; i <= 5; i++) breakdown.putIfAbsent(i, 0L);
        double avg = approved.stream().mapToInt(ReviewEntity::getRating).average().orElse(0.0);
        return RatingStatsResponse.builder().average(Math.round(avg * 10.0) / 10.0).count(approved.size()).breakdown(breakdown).build();
    }

    @Override
    public boolean hasUserReviewedBook(String bookId, String userId) {
        return reviewRepository.existsByBookIdAndUserIdAndDeletedAtIsNull(bookId, userId);
    }

    @Override
    public Page<MyReviewResponse> getMyReviews(String userId, String status, Pageable pageable) {
        Specification<ReviewEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));
            predicates.add(cb.isNull(root.get("deletedAt")));
            if (status != null && !status.equalsIgnoreCase("all") && !status.isEmpty()) {
                try {
                    ReviewStatus reviewStatus = ReviewStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), reviewStatus));
                } catch (IllegalArgumentException e) {}
            }
            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<ReviewEntity> reviews = reviewRepository.findAll(spec, pageable);
        return reviews.map(entity -> {
            String orderCode = "";
            if (entity.getOrderDetail() != null && entity.getOrderDetail().getOrder() != null) {
                orderCode = entity.getOrderDetail().getOrder().getOrderCode();
            }
            List<ReviewImageResponse> images = new ArrayList<>();
            if (entity.getImages() != null) {
                images = entity.getImages().stream().map(img -> {
                    ReviewImageResponse imgRes = new ReviewImageResponse();
                    imgRes.setId(img.getId());
                    imgRes.setImageUrl(img.getImageUrl());
                    return imgRes;
                }).collect(Collectors.toList());
            }
            ReviewReplyResponse replyRes = null;
            if (entity.getReply() != null) {
                replyRes = ReviewReplyResponse.builder().id(entity.getReply().getId()).content(entity.getReply().getContent()).createdAt(entity.getReply().getCreatedAt()).build();
            }
            return MyReviewResponse.builder()
                    .id(entity.getId())
                    .rating(entity.getRating())
                    .content(entity.getContent())
                    .status(entity.getStatus())
                    .createdAt(entity.getCreatedAt())
                    .helpfulVotes(entity.getHelpfulVotes() != null ? entity.getHelpfulVotes().size() : 0)
                    .images(images)
                    .reply(replyRes)
                    .bookId(entity.getBook().getId())
                    .bookTitle(entity.getBook().getTitle())
                    .bookThumbnail(entity.getBook().getThumbnail())
                    .bookSlug(entity.getBook().getSlug())
                    .orderCode(orderCode)
                    .build();
        });
    }
}