package com.college.eventmanagement.dto;

import com.college.eventmanagement.entity.Event;
import com.college.eventmanagement.entity.EventStatus;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * The event information sent to the React app.
 *
 * It adds the calculated fields the UI needs - registeredCount, seatsLeft
 * and a few readable date strings - so the frontend does not have to
 * repeat the same logic in JavaScript.
 */
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venue;
    private String department;
    private String organizer;
    private Integer capacity;
    private LocalDate registrationDeadline;
    private EventStatus status;

    // calculated / convenience fields
    private int registeredCount;
    private int seatsLeft;
    private boolean full;
    private boolean registrationOpen;
    private String organizerName;

    public EventResponse() { }

    /**
     * Builds the response from an Event entity.
     *
     * @param event           the entity
     * @param registrationOpen whether a student may register right now
     */
    public static EventResponse from(Event event, boolean registrationOpen) {
        EventResponse dto = new EventResponse();
        dto.id = event.getId();
        dto.title = event.getTitle();
        dto.description = event.getDescription();
        dto.eventDate = event.getEventDate();
        dto.eventTime = event.getEventTime();
        dto.venue = event.getVenue();
        dto.department = event.getDepartment();
        dto.organizer = event.getOrganizer();
        dto.capacity = event.getCapacity();
        dto.registrationDeadline = event.getRegistrationDeadline();
        dto.status = event.getStatus();

        dto.registeredCount = event.getRegisteredCount();
        dto.seatsLeft = event.getSeatsLeft();
        dto.full = dto.seatsLeft <= 0;
        dto.registrationOpen = registrationOpen;

        if (event.getCreatedBy() != null) {
            dto.organizerName = event.getCreatedBy().getFullName();
        }
        return dto;
    }

    // ---------------- getters and setters ----------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public int getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(int registeredCount) {
        this.registeredCount = registeredCount;
    }

    public int getSeatsLeft() { return seatsLeft; }
    public void setSeatsLeft(int seatsLeft) { this.seatsLeft = seatsLeft; }

    public boolean isFull() { return full; }
    public void setFull(boolean full) { this.full = full; }

    public boolean isRegistrationOpen() { return registrationOpen; }
    public void setRegistrationOpen(boolean registrationOpen) {
        this.registrationOpen = registrationOpen;
    }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
}
