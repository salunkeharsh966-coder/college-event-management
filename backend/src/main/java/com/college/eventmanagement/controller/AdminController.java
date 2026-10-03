package com.college.eventmanagement.controller;

import com.college.eventmanagement.config.AuthInterceptor;
import com.college.eventmanagement.dto.*;
import com.college.eventmanagement.entity.User;
import com.college.eventmanagement.service.EventService;
import com.college.eventmanagement.service.RegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only APIs.
 *
 * Every URL below starts with /api/admin, so AuthInterceptor checks that the
 * caller's X-User-Id belongs to a user with the ADMIN role before the request
 * reaches these methods.
 *
 *   GET    /api/admin/dashboard                        -> statistics
 *   POST   /api/admin/events                           -> create
 *   PUT    /api/admin/events/{id}                      -> update
 *   DELETE /api/admin/events/{id}                      -> delete
 *   GET    /api/admin/events/{id}/registrations        -> who registered
 *   GET    /api/admin/registrations                    -> every registration
 *   PUT    /api/admin/registrations/{id}/status        -> mark attended
 *   DELETE /api/admin/registrations/{id}               -> remove a registration
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EventService eventService;
    private final RegistrationService registrationService;

    public AdminController(EventService eventService,
                           RegistrationService registrationService) {
        this.eventService = eventService;
        this.registrationService = registrationService;
    }

    // ------------------------------------------------------------------
    // dashboard
    // ------------------------------------------------------------------

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        return ResponseEntity.ok(registrationService.getDashboardStats());
    }

    // ------------------------------------------------------------------
    // events - full CRUD
    // ------------------------------------------------------------------

    /** CREATE */
    @PostMapping("/events")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request,
            HttpServletRequest httpRequest) {

        // AuthInterceptor already loaded and stored the admin user.
        User admin = (User) httpRequest.getAttribute(AuthInterceptor.CURRENT_USER);

        EventResponse created = eventService.create(request, admin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created successfully.", created));
    }

    /** UPDATE */
    @PutMapping("/events/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {

        EventResponse updated = eventService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Event updated successfully.", updated));
    }

    /** DELETE */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(
                "Event deleted successfully. Its registrations were removed too."));
    }

    // ------------------------------------------------------------------
    // registrations
    // ------------------------------------------------------------------

    /** Every registration in the system, for the main admin table. */
    @GetMapping("/registrations")
    public ResponseEntity<List<RegistrationResponse>> allRegistrations() {
        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    /** Only the students who registered for one particular event. */
    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<List<RegistrationResponse>> registrationsForEvent(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsForEvent(eventId));
    }

    /** Mark a registration as ATTENDED or CANCELLED. */
    @PutMapping("/registrations/{id}/status")
    public ResponseEntity<ApiResponse<RegistrationResponse>> updateRegistrationStatus(
            @PathVariable Long id, @RequestParam String value) {

        RegistrationResponse updated = registrationService.updateStatus(id, value);
        return ResponseEntity.ok(ApiResponse.ok("Registration updated successfully.", updated));
    }

    /** Remove a registration row entirely. */
    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRegistration(@PathVariable Long id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.ok(ApiResponse.ok("Registration removed successfully."));
    }
}
