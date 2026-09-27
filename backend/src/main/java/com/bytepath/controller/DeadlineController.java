package com.bytepath.controller;

import com.bytepath.dto.request.DeadlineRequest;
import com.bytepath.model.Deadline;
import com.bytepath.model.User;
import com.bytepath.service.StudentDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for student assignment, exam, and project deadline tracking.
 */
@RestController
@RequestMapping("/api/deadlines")
@Tag(name = "Deadlines", description = "Student deadline / task tracker")
@SecurityRequirement(name = "Bearer Authentication")
public class DeadlineController {

    private static final Logger log = LoggerFactory.getLogger(DeadlineController.class);

    private final StudentDataService studentDataService;

    public DeadlineController(StudentDataService studentDataService) {
        this.studentDataService = studentDataService;
    }

    @Operation(summary = "Get all deadlines (sorted by due date)")
    @GetMapping
    public ResponseEntity<List<Deadline>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(studentDataService.getDeadlines(user));
    }

    @Operation(summary = "Create a new deadline")
    @PostMapping
    public ResponseEntity<Deadline> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DeadlineRequest request) {
        log.info("Student '{}' creating deadline '{}'", user.getLoginId(), request.getTitle());
        Deadline created = studentDataService.createDeadline(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Update an existing deadline")
    @PutMapping("/{id}")
    public ResponseEntity<Deadline> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody DeadlineRequest request) {
        log.info("Student '{}' updating deadline id={}", user.getLoginId(), id);
        Deadline updated = studentDataService.updateDeadline(user, id, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete a deadline")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        log.info("Student '{}' deleting deadline id={}", user.getLoginId(), id);
        studentDataService.deleteDeadline(user, id);
        return ResponseEntity.noContent().build();
    }
}
