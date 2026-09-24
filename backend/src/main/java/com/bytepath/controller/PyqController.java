package com.bytepath.controller;

import com.bytepath.model.PyqResource;
import com.bytepath.model.User;
import com.bytepath.dto.request.PyqUploadInitRequest;
import com.bytepath.dto.response.PyqAccessResponse;
import com.bytepath.dto.response.PyqUploadInitResponse;
import com.bytepath.service.StudentDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;

@RestController
@RequestMapping("/api/pyqs")
@Tag(name = "PYQ Resources", description = "Previous Year Question papers and study resources")
public class PyqController {

    private final StudentDataService dataService;
    private final com.bytepath.service.SupabaseStorageService storage;
    private final com.bytepath.service.DocumentProcessingService documents;

    public PyqController(StudentDataService dataService, com.bytepath.service.SupabaseStorageService storage,
                         com.bytepath.service.DocumentProcessingService documents) {
        this.dataService = dataService;
        this.storage = storage; this.documents = documents;
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<ByteArrayResource> view(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                   HttpServletRequest request) {
        var access = dataService.createPyqAccess(user, id, request.getRemoteAddr(), request.getHeader("User-Agent"));
        var resource = dataService.findPyq(id);
        byte[] bytes = storage.getObjectBytes(resource.getObjectKey());
        if ("application/pdf".equalsIgnoreCase(resource.getMimeType()))
            bytes = documents.watermarkPdf(bytes, user.getLoginId() + " | " + user.getEmail());
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"protected-study-file\"")
            .contentType(MediaType.parseMediaType(resource.getMimeType())).body(new ByteArrayResource(bytes));
    }

    @Operation(summary = "Get all PYQ resources (public)")
    @GetMapping
    public ResponseEntity<List<PyqResource>> getAll() {
        return ResponseEntity.ok(dataService.getAllPyqs());
    }

    @Operation(summary = "Get PYQ resources for a specific semester")
    @GetMapping("/semester/{sem}")
    public ResponseEntity<List<PyqResource>> getBySemester(@PathVariable int sem) {
        return ResponseEntity.ok(dataService.getPyqsBySemester(sem));
    }

    @Operation(summary = "Upload a new PYQ resource (ADMIN only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<PyqResource> create(
            @AuthenticationPrincipal User user,
            @RequestBody PyqResource pyq) {
        return ResponseEntity.ok(dataService.createPyq(pyq));
    }

    @PostMapping("/upload-init")
    public ResponseEntity<PyqUploadInitResponse> initUpload(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PyqUploadInitRequest request) {
        return ResponseEntity.ok(dataService.initPyqUpload(user, request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PyqResource> completeUpload(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(dataService.completePyqUpload(user, id));
    }

    @PutMapping("/{id}/upload")
    public ResponseEntity<Void> upload(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestPart("file") org.springframework.web.multipart.MultipartFile file) {
        dataService.uploadPyq(user, id, file);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/access-url")
    public ResponseEntity<PyqAccessResponse> accessUrl(
            @AuthenticationPrincipal User user,
            @PathVariable Long id, HttpServletRequest request) {
        return ResponseEntity.ok(dataService.createPyqAccess(user, id,
            request.getRemoteAddr(), request.getHeader("User-Agent")));
    }

    @GetMapping("/{id}/pages")
    public ResponseEntity<java.util.Map<String, Integer>> pageCount(
            @AuthenticationPrincipal User user, @PathVariable Long id, HttpServletRequest request) {
        dataService.createPyqAccess(user, id, request.getRemoteAddr(), request.getHeader("User-Agent"));
        var resource = dataService.findPyq(id);
        if (!"application/pdf".equalsIgnoreCase(resource.getMimeType())) {
            throw new IllegalArgumentException("Only PDF resources support protected page viewing.");
        }
        return ResponseEntity.ok(java.util.Map.of("pages", documents.pageCount(storage.getObjectBytes(resource.getObjectKey()))));
    }

    @GetMapping("/{id}/pages/{page}")
    public ResponseEntity<ByteArrayResource> page(
            @AuthenticationPrincipal User user, @PathVariable Long id, @PathVariable int page,
            HttpServletRequest request) {
        dataService.createPyqAccess(user, id, request.getRemoteAddr(), request.getHeader("User-Agent"));
        var resource = dataService.findPyq(id);
        byte[] rendered = documents.renderWatermarkedPage(storage.getObjectBytes(resource.getObjectKey()), page,
            user.getLoginId() + " | " + user.getEmail());
        return ResponseEntity.ok()
            .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
            .contentType(MediaType.IMAGE_PNG)
            .body(new ByteArrayResource(rendered));
    }

    @Operation(summary = "Delete a PYQ resource (ADMIN only)")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dataService.deletePyq(id);
        return ResponseEntity.noContent().build();
    }
}
