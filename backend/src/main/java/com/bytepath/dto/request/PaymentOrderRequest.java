package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PaymentOrderRequest(
    @NotBlank(message = "Plan is required")
    @Pattern(regexp = "sem|annual", message = "Plan must be sem or annual")
    String plan
) {}
