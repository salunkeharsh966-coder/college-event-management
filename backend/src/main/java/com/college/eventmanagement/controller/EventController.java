package com.college.eventmanagement.controller;

import com.college.eventmanagement.dto.EventRequest;
import com.college.eventmanagement.dto.EventResponse;
import com.college.eventmanagement.entity.EventStatus;
import com.college.eventmanagement.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public event APIs - used by the student pages and by the admin forms.
 *
 *   GET /api/events                      -> list, with optional filters
 *   GET /api/events/{id}                 -> one event
 *   GET /api/events/departments          -> dropdown values
 *   GET /api/events/statuses             -> dropdown values
 *
 * Write operations (create / update / delete) live in AdminEventController
 * under /api/admin/events so that the role check applies only to them.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * Search and filter events.
     *
     * Examples:
     *   /api/events
     *   /api/events?keyword=code
     *   /api/events?department=Computer%20Science&status=OPEN
     *   /api/events?upcoming=true
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "false") boolean upcoming) {

        // keep the event statuses honest before listing them
        eventService.closeExpiredEvents();

        return ResponseEntity.ok(
                eventService.search(keyword, department, status, upcoming));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.findById(id));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(eventService.getAllDepartments());
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<EventStatus>> getStatuses() {
        return ResponseEntity.ok(eventService.getAllStatuses());
    }
}
