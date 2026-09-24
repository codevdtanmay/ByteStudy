package com.bytepath.controller;

import com.bytepath.dto.request.FeedbackRequest;
import com.bytepath.dto.response.FeedbackResponse;
import com.bytepath.model.Feedback;
import com.bytepath.model.User;
import com.bytepath.repository.FeedbackRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@Tag(name = "Student Feedback", description = "Testing-phase feedback from students")
@SecurityRequirement(name = "Bearer Authentication")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Operation(summary = "Submit feedback")
    @PostMapping
    public ResponseEntity<FeedbackResponse> submit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FeedbackRequest request) {
        Feedback feedback = Feedback.builder()
            .user(user)
            .type(request.getType().trim())
            .message(request.getMessage().trim())
            .build();
        return ResponseEntity.ok(FeedbackResponse.from(feedbackRepository.save(feedback)));
    }

    @Operation(summary = "List all student feedback (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAll() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(FeedbackResponse::from)
            .toList());
    }
}
