package com.bytepath.controller;

import com.bytepath.dto.request.ChatMessageRequest;
import com.bytepath.model.ChatMessage;
import com.bytepath.model.User;
import com.bytepath.service.AdvisorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller exposing student AI advisor conversational endpoints.
 * Fully decoupled from data persistence layer via AdvisorService.
 */
@RestController
@RequestMapping("/api/advisor")
@Tag(name = "ByteAI Advisor", description = "AI-powered study advisor chat")
@SecurityRequirement(name = "Bearer Authentication")
public class AdvisorController {

    private static final Logger log = LoggerFactory.getLogger(AdvisorController.class);

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @Operation(summary = "Get full chat history (oldest first)")
    @GetMapping("/chat")
    public ResponseEntity<List<ChatMessage>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(advisorService.getHistory(user));
    }

    @Operation(summary = "Send a message to ByteAI — returns the AI reply")
    @PostMapping("/chat")
    public ResponseEntity<ChatMessage> sendMessage(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChatMessageRequest request) {
        log.info("Processing ByteAI query for student='{}'", user.getLoginId());
        ChatMessage aiReply = advisorService.processMessage(user, request.getText().trim());
        return ResponseEntity.ok(aiReply);
    }

    @Operation(summary = "Clear all chat messages and reset with welcome message")
    @DeleteMapping("/chat")
    public ResponseEntity<Void> clearChat(@AuthenticationPrincipal User user) {
        log.info("Clearing ByteAI chat history for student='{}'", user.getLoginId());
        advisorService.clearHistory(user);
        return ResponseEntity.noContent().build();
    }
}
