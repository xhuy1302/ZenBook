package com.haui.ZenBook.controller.customer;

import com.haui.ZenBook.dto.AiRecommendation.RecommendationSectionDto;
import com.haui.ZenBook.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/for-you")
    public ResponseEntity<List<RecommendationSectionDto>> getPersonalized(
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(recommendationService.getPersonalizedRecommendations(userId));
    }
}