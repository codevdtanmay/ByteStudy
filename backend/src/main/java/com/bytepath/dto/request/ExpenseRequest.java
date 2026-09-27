package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Validated incoming payload for student expense creation and update.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotNull(message = "Expense amount is required")
    @Positive(message = "Expense amount must be strictly positive")
    private Double amount;

    @NotBlank(message = "Expense category is required")
    @Size(min = 2, max = 50, message = "Category must be between 2 and 50 characters")
    private String category;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @NotNull(message = "Expense date is required")
    private LocalDate date;

    /** Optional alias for description supported for flexibility */
    private String title;

    public String resolveDescription() {
        if (description != null && !description.isBlank()) return description.trim();
        if (title != null && !title.isBlank()) return title.trim();
        return "Expense";
    }
}
