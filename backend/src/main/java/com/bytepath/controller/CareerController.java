package com.bytepath.controller;

import com.bytepath.model.User;
import com.bytepath.data.SyllabusData;
import com.bytepath.service.GeminiClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/career")
@Tag(name = "Career AI", description = "AI-generated career roadmaps")
@SecurityRequirement(name = "Bearer Authentication")
public class CareerController {
    private final GeminiClient geminiClient;

    public CareerController(GeminiClient geminiClient) { this.geminiClient = geminiClient; }

    @Operation(summary = "Build a personalized career roadmap")
    @PostMapping("/roadmap")
    public ResponseEntity<Map<String, String>> buildRoadmap(@AuthenticationPrincipal User user,
                                                             @RequestBody Map<String, Object> body) {
        String goal = String.valueOf(body.getOrDefault("goal", "full-stack software developer"));
        String phase = String.valueOf(body.getOrDefault("phase", "current undergraduate phase"));
        String semester = String.valueOf(body.getOrDefault("semester", "1"));
        String duration = requestedDuration(goal, String.valueOf(body.getOrDefault("duration", "90")));
        String name = user.getName() == null ? "student" : user.getName();
        String system = "You are BytePath's practical career mentor. Use the supplied BytePath syllabus as the source of truth for subjects and sequencing. Create realistic, India-aware career roadmaps for undergraduate CS students. Use Markdown, prioritize free or low-cost resources, and never promise a job. The requested duration is authoritative: do not expand or replace it with 90 days. Keep the response focused and measurable.";
        String prompt = String.format("Student: %s\nCurrent semester: %s\nCurrent phase: %s\nRequested goal: %s\nEXACT ROADMAP DURATION: %s days.\nBuild exactly a %s-day roadmap with an outcome, skill sequence, time-boxed milestones, two portfolio projects scaled to this duration, interview preparation, and the next 3 actions.\n\nFULL BYTEPATH SYLLABUS:\n%s", name, semester, phase, goal, duration, duration, SyllabusData.catalogSummary());
        return geminiClient.ask(system, prompt, 1400)
            .map(answer -> ResponseEntity.ok(Map.of("roadmap", answer)))
            .orElseGet(() -> ResponseEntity.status(503).body(Map.of("message", "AI roadmap is not configured or temporarily unavailable.")));
    }

    private String requestedDuration(String goal, String fallback) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern
            .compile("(?i)\\b(\\d{1,3})\\s*[- ]?days?\\b")
            .matcher(goal);
        String value = matcher.find() ? matcher.group(1) : fallback;
        try {
            int days = Integer.parseInt(value);
            return String.valueOf(Math.max(1, Math.min(days, 365)));
        } catch (NumberFormatException ignored) {
            return "90";
        }
    }
}
