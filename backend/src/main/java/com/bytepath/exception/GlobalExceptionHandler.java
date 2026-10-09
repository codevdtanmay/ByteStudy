package com.bytepath.exception;

import com.bytepath.dto.response.ApiErrorResponse;
import com.bytepath.dto.response.ValidationErrorDetail;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Centralized, production-grade exception handler.
 * Guarantees RFC 7807-compliant structured JSON errors across all API surfaces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 400 — Bean Validation failure on request body (@Valid).
     * Extracts individual field failures for granular client reporting.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ValidationErrorDetail> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> ValidationErrorDetail.builder()
                        .field(fieldError.getField())
                        .rejectedValue(fieldError.getRejectedValue())
                        .message(fieldError.getDefaultMessage())
                        .build())
                .toList();

        String primaryMessage = fieldErrors.isEmpty()
                ? "Request payload validation failed."
                : fieldErrors.get(0).getField() + ": " + fieldErrors.get(0).getMessage();

        log.warn("Validation error on {} {}: {} field errors", 
                request.getMethod(), request.getRequestURI(), fieldErrors.size());

        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST, primaryMessage, request.getRequestURI(), fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * 400 — Constraint violation on path or query parameters.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        log.warn("Constraint violation on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * 400 — Malformed or unparseable JSON payload.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Malformed JSON payload on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST, "Malformed JSON request body.", request.getRequestURI()));
    }

    /**
     * 400 — Path parameter or query param type mismatch.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = String.format("Parameter '%s' should be of type '%s'.", 
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        log.warn("Type mismatch on {} {}: {}", request.getMethod(), request.getRequestURI(), message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST, message, request.getRequestURI()));
    }

    /**
     * 400 — Explicit bad request / illegal argument.
     */
    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiErrorResponse> handleBadRequest(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Bad request on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.of(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * 401 — Unauthenticated / Bad credentials.
     */
    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Authentication failed on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorResponse.of(HttpStatus.UNAUTHORIZED, 
                        ex.getMessage() != null ? ex.getMessage() : "Authentication required.", 
                        request.getRequestURI()));
    }

    /**
     * 403 — Forbidden / Access denied.
     */
    @ExceptionHandler({ForbiddenException.class, AccessDeniedException.class, SecurityException.class})
    public ResponseEntity<ApiErrorResponse> handleForbidden(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Access denied on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiErrorResponse.of(HttpStatus.FORBIDDEN, "Access denied. Insufficient permissions.", request.getRequestURI()));
    }

    /**
     * 404 — Entity or resource not found.
     */
    @ExceptionHandler({ResourceNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RuntimeException ex, HttpServletRequest request) {
        log.warn("Resource not found on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * 409 — Resource state conflict (e.g. unique constraint).
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(
            ConflictException ex, HttpServletRequest request) {
        log.warn("Conflict on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * 422 — Business logic validation error.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            ValidationException ex, HttpServletRequest request) {
        log.warn("Unprocessable entity on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiErrorResponse.of(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request.getRequestURI()));
    }

    /**
     * 503 — External downstream dependency unavailable.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleServiceUnavailable(
            IllegalStateException ex, HttpServletRequest request) {
        // Keep the public response generic, but retain the stack trace in server logs so
        // downstream failures (DNS, connect timeout, TLS, etc.) can be diagnosed safely.
        log.error("Service unavailable on {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage(), ex);
        String message = ex.getMessage() == null ? "The service is temporarily unavailable." : ex.getMessage();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiErrorResponse.of(HttpStatus.SERVICE_UNAVAILABLE, message, request.getRequestURI()));
    }

    /**
     * 500 — Unhandled unexpected exception.
     * Generates a correlation ID, logs the full stack trace, and returns sanitized message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneral(
            Exception ex, HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unhandled internal server exception [correlationId={}] on {} {}",
                correlationId, request.getMethod(), request.getRequestURI(), ex);

        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred. Please reference correlation ID: " + correlationId,
                request.getRequestURI(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
