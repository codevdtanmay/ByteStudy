package com.bytepath.dto.response;

import com.bytepath.model.Feedback;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        String type,
        String message,
        String status,
        Instant createdAt,
        String studentName,
        String studentLoginId,
        String studentEmail) {

    public static FeedbackResponse from(Feedback feedback) {
        var user = feedback.getUser();
        return new FeedbackResponse(
            feedback.getId(), feedback.getType(), feedback.getMessage(), feedback.getStatus(),
            feedback.getCreatedAt(), user.getName(), user.getLoginId(), user.getEmail());
    }
}
