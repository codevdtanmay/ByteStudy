package com.bytepath.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StudentVideoLinkRequest {
    @NotBlank(message = "Course code is required")
    private String courseCode;

    private int semesterNumber;

    @NotBlank(message = "YouTube link is required")
    @Size(max = 1000, message = "YouTube link is too long")
    private String url;
}
