package com.college.eventmanagement.controller;

import com.college.eventmanagement.dto.ApiResponse;
import com.college.eventmanagement.dto.EventResponse;
import com.college.eventmanagement.dto.RegistrationResponse;
import com.college.eventmanagement.entity.User;
import com.college.eventmanagement.service.EventService;
import com.college.eventmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Student-facing registration APIs.
 *
 *   POST   /api/registrations                  -> register for an event
 *   GET    /api/registrations/my/{userId}      -> my registered events
 *   DELETE /api/registrations/{id}/cancel      -> cancel my registration
 *
 * A real system would take the student id from a JWT. This project sends it
 * as a query parameter / request field so the flow stays easy to follow.
 */
@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    /**
     * Register the logged-in student for an event.
     *
     * Request body: { "userId": 2, "eventId": 1 }
     * A small static inner class is enough here - no separate DTO file needed.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @Valid @RequestBody RegisterForEventBody body) {

        RegistrationResponse result = registrationService.register(
                body.getUserId(), body.getEventId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("You have been registered successfully!", result));
    }

    /** The "My Registered Events" list on the student dashboard. */
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<RegistrationResponse>> myRegistrations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getMyRegistrations(userId));
    }

    /** Cancel one of my own registrations. */
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable Long id, @RequestParam Long userId) {

        registrationService.cancelByStudent(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Registration cancelled successfully."));
    }

    /** Request body for POST /api/registrations. */
    public static class RegisterForEventBody {
        private Long userId;
        private Long eventId;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getEventId() { return eventId; }
        public void setEventId(Long eventId) { this.eventId = eventId; }
    }
}
