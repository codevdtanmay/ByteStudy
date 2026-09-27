package com.bytepath.controller;

import com.bytepath.dto.request.AttendanceLogRequest;
import com.bytepath.model.AttendanceLog;
import com.bytepath.model.User;
import com.bytepath.service.AttendanceService;
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
import java.util.Map;

/**
 * REST controller managing student attendance records and analytics.
 */
@RestController
@RequestMapping("/api/attendance")
@Tag(name = "Attendance", description = "Attendance log management and summary")
@SecurityRequirement(name = "Bearer Authentication")
public class AttendanceController {

    private static final Logger log = LoggerFactory.getLogger(AttendanceController.class);

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Operation(summary = "Get all attendance logs (newest first)")
    @GetMapping
    public ResponseEntity<List<AttendanceLog>> getLogs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(attendanceService.getLogs(user));
    }

    @Operation(summary = "Add a new attendance log entry")
    @PostMapping
    public ResponseEntity<AttendanceLog> addLog(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AttendanceLogRequest request) {
        log.info("Student '{}' logging attendance for course '{}'", user.getLoginId(), request.getCourseCode());
        AttendanceLog created = attendanceService.addLog(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Delete an attendance log entry")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        log.info("Student '{}' deleting attendance entry id={}", user.getLoginId(), id);
        attendanceService.deleteLog(user, id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get overall attendance % and per-subject breakdown")
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "overallPercent", attendanceService.overallPercent(user),
                "breakdown", attendanceService.subjectBreakdown(user)
        ));
    }
}
