package com.bytepath.controller;

import com.bytepath.dto.request.AchieverRequest;
import com.bytepath.model.HnbguAchiever;
import com.bytepath.service.AchieverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for HNBGU University student achiever profiles.
 */
@RestController
@Tag(name = "Achievers", description = "HNBGU University Achievers Showcase and Management")
public class AchieverController {

    private static final Logger log = LoggerFactory.getLogger(AchieverController.class);

    private final AchieverService achieverService;

    public AchieverController(AchieverService achieverService) {
        this.achieverService = achieverService;
    }

    @Operation(summary = "Get all HNBGU student achievers (public)")
    @GetMapping("/api/achievers")
    public ResponseEntity<List<HnbguAchiever>> getAllAchievers() {
        return ResponseEntity.ok(achieverService.getAllAchievers());
    }

    @Operation(summary = "Add or update an achiever (ADMIN only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/achievers")
    public ResponseEntity<HnbguAchiever> saveAchiever(@Valid @RequestBody AchieverRequest request) {
        log.info("Admin creating/updating achiever: '{}'", request.getName());
        HnbguAchiever saved = achieverService.saveAchiever(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Delete an achiever (ADMIN only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/achievers/{id}")
    public ResponseEntity<Map<String, Object>> deleteAchiever(@PathVariable Long id) {
        log.info("Admin deleting achiever id={}", id);
        achieverService.deleteAchiever(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Achiever deleted successfully."
        ));
    }
}
