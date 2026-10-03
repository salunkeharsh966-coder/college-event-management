package com.college.eventmanagement.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Body for POST /api/events and PUT /api/events/{id}.
 *
 * The validation annotations are checked automatically by Spring when the
 * controller parameter is marked @Valid. If any rule fails, the
 * GlobalExceptionHandler turns the errors into a friendly JSON message.
 */
public class EventRequest {

    @NotBlank(message = "Event title is required")
    @Size(max = 150, message = "Title must be at most 150 characters")
    private String title;

    @Size(max = 2000, message = "Description is too long")
    private String description;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Event time is required")
    private LocalTime eventTime;

    @NotBlank(message = "Venue is required")
    @Size(max = 150, message = "Venue must be at most 150 characters")
    private String venue;

    private String department;
    private String organizer;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity looks too large")
    private Integer capacity;

    @NotNull(message = "Registration deadline is required")
    private LocalDate registrationDeadline;

    /** Optional. If omitted the service defaults to OPEN. */
    private String status;

    public EventRequest() { }

    // ---------------- getters and setters ----------------

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public LocalDate getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDate registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
