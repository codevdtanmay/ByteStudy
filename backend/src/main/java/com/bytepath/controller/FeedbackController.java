package com.bytepath.controller;

import com.bytepath.dto.request.FeedbackRequest;
import com.bytepath.dto.response.FeedbackResponse;
import com.bytepath.model.User;
import com.bytepath.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller managing student feedback submission and administrator review.
 */
@RestController
@RequestMapping("/api/feedback")
@Tag(name = "Student Feedback", description = "Testing-phase feedback from students")
@SecurityRequirement(name = "Bearer Authentication")
public class FeedbackController {

    private static final Logger log = LoggerFactory.getLogger(FeedbackController.class);

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @Operation(summary = "Submit feedback")
    @PostMapping
    public ResponseEntity<FeedbackResponse> submit(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody FeedbackRequest request) {
        log.info("Student '{}' submitted feedback of type '{}'", user.getLoginId(), request.getType());
        FeedbackResponse response = feedbackService.submitFeedback(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "List all student feedback (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAll() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
