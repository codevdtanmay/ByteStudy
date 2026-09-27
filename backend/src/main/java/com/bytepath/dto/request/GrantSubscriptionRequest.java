package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantSubscriptionRequest {
    @NotBlank(message = "Student email is required")
    private String email;

    @Builder.Default
    private String plan = "END_SEM";

    private Integer semester;

    /** Number of days. 0 or null indicates permanent access */
    private Integer durationDays;

    private String note;
}
