package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchieverRequest {

    private Long id;

    @NotBlank(message = "Achiever name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Branch is required")
    @Size(min = 2, max = 50, message = "Branch must be between 2 and 50 characters")
    private String branch;

    @NotBlank(message = "Batch is required")
    @Size(min = 4, max = 20, message = "Batch must be between 4 and 20 characters")
    private String batch;

    @Size(max = 20, message = "CGPA cannot exceed 20 characters")
    private String cgpa;

    @NotBlank(message = "Achievement title cannot be blank")
    @Size(min = 2, max = 150, message = "Achievement title must be between 2 and 150 characters")
    private String achievementTitle;

    @Size(max = 1000, message = "Quote cannot exceed 1000 characters")
    private String quote;

    @Size(max = 100, message = "Company or exam name cannot exceed 100 characters")
    private String companyOrExam;

    @Size(max = 1000, message = "Photo URL cannot exceed 1000 characters")
    private String photoUrl;

    @Size(max = 50, message = "Badge label cannot exceed 50 characters")
    private String badgeLabel;
}
