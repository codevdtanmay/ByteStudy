package com.bytepath.service;

import com.bytepath.dto.request.AttendanceLogRequest;
import com.bytepath.exception.ForbiddenException;
import com.bytepath.exception.ResourceNotFoundException;
import com.bytepath.model.AttendanceLog;
import com.bytepath.model.User;
import com.bytepath.repository.AttendanceLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Attendance tracking service — record class sessions, compute analytics and per-course breakdowns.
 */
@Service
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceLogRepository repo;

    public AttendanceService(AttendanceLogRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<AttendanceLog> getLogs(User user) {
        return repo.findByUserOrderByDateDesc(user);
    }

    @Transactional
    public AttendanceLog addLog(User user, AttendanceLogRequest request) {
        log.info("Recording attendance for user='{}', course='{}', date={}, status={}",
                user.getLoginId(), request.getCourseCode(), request.getDate(), request.getStatus());

        AttendanceLog attendanceLog = AttendanceLog.builder()
                .user(user)
                .courseCode(request.getCourseCode().trim())
                .courseName(request.getCourseName() != null ? request.getCourseName().trim() : null)
                .date(request.getDate())
                .status(request.getStatus())
                .build();

        return repo.save(attendanceLog);
    }

    @Transactional
    public AttendanceLog addLog(User user, AttendanceLog logEntry) {
        logEntry.setUser(user);
        return repo.save(logEntry);
    }

    @Transactional
    public void deleteLog(User user, Long logId) {
        log.info("Deleting attendance log id={} for user='{}'", logId, user.getLoginId());
        AttendanceLog entry = repo.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance log", "id", logId));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied. You do not own this attendance log.");
        }
        repo.delete(entry);
    }

    /**
     * Overall attendance percentage across all logged sessions.
     */
    @Transactional(readOnly = true)
    public String overallPercent(User user) {
        List<AttendanceLog> logs = getLogs(user);
        if (logs.isEmpty()) return "N/A";
        long present = logs.stream()
                .filter(l -> l.getStatus() == AttendanceLog.AttendanceStatus.Present)
                .count();
        return String.format(Locale.US, "%.1f", (present * 100.0) / logs.size());
    }

    /**
     * Per-course attendance breakdown analytics.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> subjectBreakdown(User user) {
        List<AttendanceLog> logs = getLogs(user);
        Map<String, List<AttendanceLog>> byCourse = logs.stream()
                .collect(Collectors.groupingBy(AttendanceLog::getCourseCode));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<AttendanceLog>> entry : byCourse.entrySet()) {
            List<AttendanceLog> courseLogs = entry.getValue();
            long present = courseLogs.stream()
                    .filter(l -> l.getStatus() == AttendanceLog.AttendanceStatus.Present)
                    .count();
            double pct = (present * 100.0) / courseLogs.size();

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("code", entry.getKey());
            row.put("courseName", courseLogs.get(0).getCourseName());
            row.put("present", (int) present);
            row.put("total", courseLogs.size());
            row.put("percentage", Math.round(pct * 10) / 10.0);
            result.add(row);
        }
        return result;
    }
}
