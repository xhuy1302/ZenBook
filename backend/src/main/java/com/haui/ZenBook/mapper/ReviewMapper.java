package com.haui.ZenBook.mapper;

import com.haui.ZenBook.dto.review.ReviewDetailResponse;
import com.haui.ZenBook.dto.review.ReviewReplyResponse;
import com.haui.ZenBook.dto.review.ReviewSummaryResponse;
import com.haui.ZenBook.entity.ReviewEntity;
import com.haui.ZenBook.entity.ReviewReplyEntity;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ReviewMapper {

    // 1. Chuyển đổi Entity sang DTO Danh sách (Cho Admin)
    public ReviewSummaryResponse toSummaryResponse(ReviewEntity entity) {
        if (entity == null) return null;

        // Xử lý cắt ngắn nội dung nếu quá dài (Hiển thị preview)
        String snippet = entity.getContent();
        if (snippet != null && snippet.length() > 100) {
            snippet = snippet.substring(0, 100) + "...";
        }

        return ReviewSummaryResponse.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .title(entity.getTitle())
                .contentSnippet(snippet)
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())

                // Book Info
                .bookId(entity.getBook() != null ? entity.getBook().getId() : null)
                .bookTitle(entity.getBook() != null ? entity.getBook().getTitle() : null)
                .bookThumbnail(entity.getBook() != null ? entity.getBook().getThumbnail() : null)

                // User Info
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userFullName(entity.getUser() != null ? entity.getUser().getFullName() : null)
                .userAvatar(entity.getUser() != null ? entity.getUser().getAvatar() : null)

                // Logic flags
                .hasImages(entity.getImages() != null && !entity.getImages().isEmpty())
                .isReplied(entity.getReply() != null)
                .build();
    }

    // 2. Chuyển đổi Entity sang DTO Chi tiết (Cho Admin)
    public ReviewDetailResponse toDetailResponse(ReviewEntity entity) {
        if (entity == null) return null;

        ReviewDetailResponse.ReviewDetailResponseBuilder builder = ReviewDetailResponse.builder()
                .id(entity.getId())
                .rating(entity.getRating())
                .title(entity.getTitle())
                .content(entity.getContent())
                .status(entity.getStatus())
                .isVerifiedPurchase(entity.getIsVerifiedPurchase())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .helpfulVotesCount(entity.getHelpfulVotes() != null ? entity.getHelpfulVotes().size() : 0);

        // Map User Info
        if (entity.getUser() != null) {
            builder.user(ReviewDetailResponse.UserInfo.builder()
                    .id(entity.getUser().getId())
                    .fullName(entity.getUser().getFullName())
                    .email(entity.getUser().getEmail())
                    .avatar(entity.getUser().getAvatar())
                    .build());
        }

        // Map Book Info
        if (entity.getBook() != null) {
            builder.book(ReviewDetailResponse.BookInfo.builder()
                    .id(entity.getBook().getId())
                    .title(entity.getBook().getTitle())
                    .slug(entity.getBook().getSlug())
                    .thumbnail(entity.getBook().getThumbnail())
                    .build());
        }

        // Map Images
        if (entity.getImages() != null && !entity.getImages().isEmpty()) {
            builder.images(entity.getImages().stream()
                    .map(img -> ReviewDetailResponse.ImageInfo.builder()
                            .id(img.getId())
                            .imageUrl(img.getImageUrl())
                            .build())
                    .collect(Collectors.toList()));
        }

        // Map Reply
        if (entity.getReply() != null) {
            ReviewReplyEntity replyEntity = entity.getReply();
            builder.reply(ReviewDetailResponse.ReplyInfo.builder()
                    .id(replyEntity.getId())
                    .content(replyEntity.getContent())
                    .createdAt(replyEntity.getCreatedAt())
                    .updatedAt(replyEntity.getUpdatedAt())
                    .repliedBy(replyEntity.getUser() != null ?
                            ReviewDetailResponse.ReplyUserInfo.builder()
                                    .id(replyEntity.getUser().getId())
                                    .fullName(replyEntity.getUser().getFullName())
                                    .build() : null)
                    .build());
        }

        return builder.build();
    }

    // 3. Chuyển đổi Entity Reply sang DTO Reply (Dùng khi Admin vừa tạo/sửa phản hồi xong)
    public ReviewReplyResponse toReplyResponse(ReviewReplyEntity entity) {
        if (entity == null) return null;

        return ReviewReplyResponse.builder()
                .id(entity.getId())
                .reviewId(entity.getReview() != null ? entity.getReview().getId() : null)
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .repliedById(entity.getUser() != null ? entity.getUser().getId() : null)
                .repliedByFullName(entity.getUser() != null ? entity.getUser().getFullName() : null)
                .build();
    }
}