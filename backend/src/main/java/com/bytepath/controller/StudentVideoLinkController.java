package com.bytepath.controller;

import com.bytepath.dto.request.StudentVideoLinkRequest;
import com.bytepath.dto.response.StudentVideoLinkResponse;
import com.bytepath.model.User;
import com.bytepath.service.StudentVideoLinkService;
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
 * Controller exposing student tutorial video curation endpoints.
 */
@RestController
@RequestMapping("/api/student-videos")
@Tag(name = "Student Tutorial Videos", description = "Student-owned YouTube tutorial lists")
@SecurityRequirement(name = "Bearer Authentication")
public class StudentVideoLinkController {

    private static final Logger log = LoggerFactory.getLogger(StudentVideoLinkController.class);

    private final StudentVideoLinkService videoLinkService;

    public StudentVideoLinkController(StudentVideoLinkService videoLinkService) {
        this.videoLinkService = videoLinkService;
    }

    @Operation(summary = "Get tutorial videos for a semester")
    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<StudentVideoLinkResponse>> getForSemester(
            @AuthenticationPrincipal User user, @PathVariable int semester) {
        return ResponseEntity.ok(videoLinkService.getForSemester(user, semester));
    }

    @Operation(summary = "Add a tutorial video link")
    @PostMapping
    public ResponseEntity<StudentVideoLinkResponse> add(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody StudentVideoLinkRequest request) {
        log.info("Student '{}' adding video link for semester {}", user.getLoginId(), request.getSemesterNumber());
        StudentVideoLinkResponse response = videoLinkService.addVideoLink(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Delete a tutorial video link")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        log.info("Student '{}' deleting video link id={}", user.getLoginId(), id);
        videoLinkService.deleteVideoLink(user, id);
        return ResponseEntity.noContent().build();
    }
}
