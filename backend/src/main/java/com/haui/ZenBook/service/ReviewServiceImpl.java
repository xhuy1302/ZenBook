package com.haui.ZenBook.service;

import com.haui.ZenBook.S3Client.S3Service;
import com.haui.ZenBook.dto.review.*;
import com.haui.ZenBook.entity.*;
import com.haui.ZenBook.enums.ReviewStatus;
import com.haui.ZenBook.exception.AppException;
import com.haui.ZenBook.exception.ErrorCode;
import com.haui.ZenBook.mapper.ReviewMapper;
import com.haui.ZenBook.repository.*;
import com.haui.ZenBook.service.ReviewService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
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
    private final S3Service s3Service; // Sử dụng dịch vụ S3 của bạn

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

    @Override
    public Page<ReviewResponse> getBookReviews(
            String bookId,
            ReviewCustomerFilter filter,
            Pageable pageable,
            String currentUserId // nullable (khách vãng lai)
    ) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND, bookId);
        }

        // 👉 QUAN TRỌNG: Tạo Pageable mới loại bỏ Sort mặc định của Spring Boot
        // để giao toàn quyền sắp xếp cho CriteriaBuilder bên dưới.
        Pageable unsortedPageable = org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        // 1. Tạo Specification để xử lý bộ lọc động (Filter) và Sắp xếp (Sort)
        Specification<ReviewEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Điều kiện bắt buộc: Đúng sách, Đã duyệt, Chưa bị xóa
            predicates.add(cb.equal(root.get("book").get("id"), bookId));
            predicates.add(cb.equal(root.get("status"), ReviewStatus.APPROVED));
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (filter != null) {
                // Lọc theo số sao
                if (filter.getRating() != null) {
                    predicates.add(cb.equal(root.get("rating"), filter.getRating()));
                }
                // Lọc theo bài viết có ảnh
                if (Boolean.TRUE.equals(filter.getHasImage())) {
                    predicates.add(cb.isNotEmpty(root.get("images")));
                }

                // 👉 XỬ LÝ SẮP XẾP TỪ FRONTEND TRUYỀN XUỐNG
                if ("helpful".equalsIgnoreCase(filter.getSortBy())) {
                    // Ưu tiên 1: Đếm số lượng vote Hữu ích giảm dần
                    // Ưu tiên 2: Nếu bằng vote, lấy bài mới hơn
                    query.orderBy(
                            cb.desc(cb.size(root.get("helpfulVotes"))),
                            cb.desc(root.get("createdAt"))
                    );
                } else {
                    // Mặc định "newest": Mới nhất lên đầu
                    query.orderBy(cb.desc(root.get("createdAt")));
                }
            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 2. Query lấy danh sách (dùng unsortedPageable)
        Page<ReviewEntity> reviews = reviewRepository.findAll(spec, unsortedPageable);

        // 3. Map sang ReviewResponse và kiểm tra isHelpfulByMe
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

            // Map list ảnh
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

            // Map Reply (nếu admin đã trả lời)
            if (entity.getReply() != null) {
                ReviewReplyResponse replyRes = ReviewReplyResponse.builder()
                        .id(entity.getReply().getId())
                        .reviewId(entity.getId())
                        .content(entity.getReply().getContent())
                        .createdAt(entity.getReply().getCreatedAt())
                        .updatedAt(entity.getReply().getUpdatedAt())
                        .repliedById(entity.getReply().getUser().getId())
                        .repliedByFullName(entity.getReply().getUser().getFullName() != null
                                ? entity.getReply().getUser().getFullName()
                                : entity.getReply().getUser().getUsername())
                        .build();

                res.setReply(replyRes);
            }

            // Kiểm tra user đăng nhập đã bấm Hữu ích chưa
            if (currentUserId != null) {
                boolean isHelpful = helpfulVoteRepository.findByReviewIdAndUserId(entity.getId(), currentUserId).isPresent();
                res.setHelpfulByMe(isHelpful);
            } else {
                res.setHelpfulByMe(false); // Khách chưa đăng nhập thì mặc định là false
            }

            return res;
        });
    }

    @Override
    @Transactional
    public ReviewDetailResponse createReview(
            String bookId,
            CreateReviewRequest request,
            String userId
    ) {
        if (reviewRepository.existsByOrderDetailIdAndDeletedAtIsNull(
                request.getOrderDetailId()
        )) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        OrderDetailEntity orderDetail =
                orderDetailRepository.findById(request.getOrderDetailId())
                        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        UserEntity user =
                userRepository.findById(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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

        return reviewMapper.toDetailResponse(
                reviewRepository.save(review)
        );
    }

    @Override
    @Transactional
    public ReviewDetailResponse updateReview(String reviewId, UpdateReviewRequest request, String userId) {
        ReviewEntity review = reviewRepository.findByIdAndDeletedAtIsNull(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Kiểm tra quyền sở hữu
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Giới hạn thời gian sửa (Ví dụ: Chỉ cho sửa trong vòng 30 ngày)
        if (review.getCreatedAt().plusDays(30).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_DATA); // Quá thời hạn
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        // Khi sửa lại nội dung, tự động chuyển về PENDING để Admin duyệt lại
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

        // Soft delete
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
            // Đã vote rồi -> Bỏ vote
            helpfulVoteRepository.delete(existingVote.get());
        } else {
            // Chưa vote -> Thêm vote
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
        boolean isHelpful = helpfulVoteRepository
                .findByReviewIdAndUserId(reviewId, userId).isPresent();

        return HelpfulVoteResponse.builder()
                .helpfulVotes(newCount)
                .isHelpful(isHelpful)
                .build();
    }

    @Override
    public String uploadReviewImage(MultipartFile file) {
        try {
            // Dùng S3Service upload vào thư mục "reviews"
            return s3Service.uploadFile(file, "reviews");
        } catch (IOException e) {
            throw new AppException(ErrorCode.UPLOAD_FAILED);
        }
    }


    // Hàm mói
    @Override
    public RatingStatsResponse getRatingStats(String bookId) {
        List<ReviewEntity> approved = reviewRepository.findByBookIdAndStatusAndDeletedAtIsNull(
                bookId, ReviewStatus.APPROVED);

        Map<Integer, Long> breakdown = approved.stream()
                .collect(Collectors.groupingBy(ReviewEntity::getRating, Collectors.counting()));

        // đảm bảo key 1-5 đều có mặt
        for (int i = 1; i <= 5; i++) breakdown.putIfAbsent(i, 0L);

        double avg = approved.stream().mapToInt(ReviewEntity::getRating)
                .average().orElse(0.0);

        return RatingStatsResponse.builder()
                .average(Math.round(avg * 10.0) / 10.0)
                .count(approved.size())
                .breakdown(breakdown)
                .build();
    }

    // hasUserReviewedBook — hàm mới (tái dùng query đã có)
    @Override
    public boolean hasUserReviewedBook(String bookId, String userId) {
        return reviewRepository.existsByBookIdAndUserIdAndDeletedAtIsNull(bookId, userId);
    }
    // ==========================================
    // LẤY DANH SÁCH ĐÁNH GIÁ CỦA TÔI (MY REVIEWS)
    // ==========================================
    @Override
    public Page<MyReviewResponse> getMyReviews(String userId, String status, Pageable pageable) {
        Specification<ReviewEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Lọc theo user hiện tại và chưa bị xóa
            predicates.add(cb.equal(root.get("user").get("id"), userId));
            predicates.add(cb.isNull(root.get("deletedAt")));

            // Lọc theo trạng thái (nếu có truyền lên từ tab 'approved', 'pending')
            if (status != null && !status.equalsIgnoreCase("all") && !status.isEmpty()) {
                try {
                    ReviewStatus reviewStatus = ReviewStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), reviewStatus));
                } catch (IllegalArgumentException e) {
                    // Bỏ qua nếu status không hợp lệ
                }
            }

            // Luôn ưu tiên Mới nhất lên đầu cho trang "Đánh giá của tôi"
            query.orderBy(cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ReviewEntity> reviews = reviewRepository.findAll(spec, pageable);

        return reviews.map(entity -> {
            // Xử lý lấy mã đơn hàng một cách an toàn
            String orderCode = "";
            if (entity.getOrderDetail() != null && entity.getOrderDetail().getOrder() != null) {
                orderCode = entity.getOrderDetail().getOrder().getOrderCode();
            }

            // Map list ảnh
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
                replyRes = ReviewReplyResponse.builder()
                        .id(entity.getReply().getId())
                        .content(entity.getReply().getContent())
                        .createdAt(entity.getReply().getCreatedAt())
                        // ... lấy thêm user nếu cần
                        .build();
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