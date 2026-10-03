package com.college.eventmanagement.exception;

/**
 * Thrown for a business-rule violation where the request is well formed but
 * not allowed - for example registering twice, or registering for a full
 * event. The GlobalExceptionHandler converts it into HTTP 400.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
