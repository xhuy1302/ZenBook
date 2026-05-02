package com.haui.ZenBook.dto.AiRecommendation;

import java.util.List;

public record AiRecommendationResponse(
        List<Section> sections
) implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    public record Section(
            String title,
            List<String> ids
    ) implements java.io.Serializable {
        private static final long serialVersionUID = 1L;
    }
}