package com.college.eventmanagement.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * One central place that turns Java exceptions into clean JSON error bodies.
 *
 * Without this class Spring would return a 500 Whitelabel page and the React
 * app would have nothing useful to display. With it, the frontend always gets
 * { "status": ..., "message": "...", "timestamp": ... } and can show the
 * message in a red alert box.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 404 - the requested row does not exist. */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    /** 400 - business rule violation (duplicate registration, event full ...). */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    /**
     * 400 - @Valid on a controller argument failed.
     * Collects every field error so the form can highlight all problems at once.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        List<FieldError> errors = ex.getBindingResult().getFieldErrors();
        for (FieldError error : errors) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }

        String firstMessage = errors.isEmpty()
                ? "Validation failed"
                : errors.get(0).getDefaultMessage();

        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST,
                firstMessage, request);
        body.put("errors", fieldErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** 409 - the database refused the row (e.g. duplicate e-mail). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT,
                "This record conflicts with existing data. "
                        + "A student can register for the same event only once.",
                request);
    }

    /** 500 - anything we did not anticipate. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(
            Exception ex, HttpServletRequest request) {

        // Print the stack trace in the server log so it can be debugged.
        ex.printStackTrace();

        Map<String, Object> body = baseBody(HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong on the server. Please try again.", request);
        body.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    private ResponseEntity<Map<String, Object>> build(
            HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(baseBody(status, message, request));
    }

    private Map<String, Object> baseBody(
            HttpStatus status, String message, HttpServletRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getRequestURI());
        return body;
    }
}
