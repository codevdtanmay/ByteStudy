package com.bytepath.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

/**
 * Enterprise standardized API error response envelope.
 * Guarantees consistent error contract across all endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private int status;
    private String error;
    private String message;
    private String path;
    @Builder.Default
    private Instant timestamp = Instant.now();
    private String correlationId;
    private List<ValidationErrorDetail> errors;

    public static ApiErrorResponse of(HttpStatus status, String message, String path) {
        return ApiErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    public static ApiErrorResponse of(HttpStatus status, String message, String path, List<ValidationErrorDetail> errors) {
        return ApiErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .errors(errors)
                .build();
    }

    public static ApiErrorResponse of(HttpStatus status, String message, String path, String correlationId) {
        return ApiErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .correlationId(correlationId)
                .build();
    }
}
