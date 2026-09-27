package com.bytepath.dto.request;

import com.bytepath.model.AttendanceLog.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Validated incoming payload for adding an attendance log.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLogRequest {

    @NotBlank(message = "Course code is required")
    @Size(min = 1, max = 100, message = "Course code must be between 1 and 100 characters")
    private String courseCode;

    @Size(max = 150, message = "Course name cannot exceed 150 characters")
    private String courseName;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Attendance status is required (Present or Absent)")
    private AttendanceStatus status;
}
