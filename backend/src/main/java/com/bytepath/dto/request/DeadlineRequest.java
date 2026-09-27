package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Validated incoming payload for creating or updating a student deadline.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeadlineRequest {

    @NotBlank(message = "Deadline title cannot be blank")
    @Size(min = 1, max = 200, message = "Deadline title must be between 1 and 200 characters")
    private String title;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Size(max = 30, message = "Priority cannot exceed 30 characters")
    private String priority;

    @Size(max = 30, message = "Status cannot exceed 30 characters")
    private String status;
}
