package com.bytepath.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standardized field-level validation error detail for 400/422 responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorDetail {
    private String field;
    private Object rejectedValue;
    private String message;
}
