package com.college.eventmanagement.exception;

/**
 * Thrown when we look up an id that does not exist, e.g. GET /api/events/999
 * The GlobalExceptionHandler converts it into HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id);
    }
}
