package com.bytepath.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyBudgetRequest {

    @NotNull(message = "Monthly budget cannot be null")
    @PositiveOrZero(message = "Monthly budget must be zero or a positive amount")
    private Double monthlyBudget;
}
