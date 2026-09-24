package com.bytepath.controller;

import com.bytepath.dto.request.StudentVideoLinkRequest;
import com.bytepath.dto.response.StudentVideoLinkResponse;
import com.bytepath.model.StudentVideoLink;
import com.bytepath.model.User;
import com.bytepath.repository.StudentVideoLinkRepository;
import com.bytepath.service.YoutubeMetadataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/student-videos")
@Tag(name = "Student Tutorial Videos", description = "Student-owned YouTube tutorial lists")
@SecurityRequirement(name = "Bearer Authentication")
public class StudentVideoLinkController {
    private final StudentVideoLinkRepository repository;
    private final YoutubeMetadataService metadataService;

    public StudentVideoLinkController(StudentVideoLinkRepository repository, YoutubeMetadataService metadataService) {
        this.repository = repository;
        this.metadataService = metadataService;
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<StudentVideoLinkResponse>> getForSemester(
            @AuthenticationPrincipal User user, @PathVariable int semester) {
        return ResponseEntity.ok(repository.findByUserAndSemesterNumberOrderByCreatedAtDesc(user, semester).stream()
            .map(StudentVideoLinkResponse::from).toList());
    }

    @PostMapping
    public ResponseEntity<StudentVideoLinkResponse> add(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody StudentVideoLinkRequest request) {
        String url = request.getUrl().trim();
        validateYoutubeUrl(url);
        if (request.getSemesterNumber() < 1 || request.getSemesterNumber() > 8) {
            throw new IllegalArgumentException("Semester must be between 1 and 8.");
        }
        StudentVideoLink video = StudentVideoLink.builder()
            .user(user)
            .semesterNumber(request.getSemesterNumber())
            .courseCode(request.getCourseCode().trim())
            .url(url)
            .title(metadataService.fetchTitle(url))
            .build();
        return ResponseEntity.ok(StudentVideoLinkResponse.from(repository.save(video)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        StudentVideoLink video = repository.findById(id)
            .orElseThrow(() -> new java.util.NoSuchElementException("Video link not found."));
        if (!video.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot delete this video link.");
        }
        repository.delete(video);
        return ResponseEntity.noContent().build();
    }

    private void validateYoutubeUrl(String value) {
        try {
            URI uri = URI.create(value);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
            boolean youtube = host.equals("youtu.be") || host.equals("youtube.com") || host.endsWith(".youtube.com");
            if (!youtube || !List.of("http", "https").contains(scheme)) throw new IllegalArgumentException("Please enter a valid YouTube link.");
        } catch (IllegalArgumentException error) {
            throw new IllegalArgumentException("Please enter a valid YouTube link.");
        }
    }
}
