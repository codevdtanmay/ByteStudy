package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotBlank(message = "Feedback type is required")
    @Size(max = 40, message = "Feedback type is too long")
    private String type;

    @NotBlank(message = "Feedback message is required")
    @Size(max = 3000, message = "Feedback must be 3000 characters or fewer")
    private String message;
}
