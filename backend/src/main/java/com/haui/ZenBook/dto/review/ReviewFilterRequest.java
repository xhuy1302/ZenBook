package com.haui.ZenBook.dto.review;

import com.haui.ZenBook.enums.ReviewStatus;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class ReviewFilterRequest {
    private String bookId;
    private Integer rating;
    private ReviewStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;
}