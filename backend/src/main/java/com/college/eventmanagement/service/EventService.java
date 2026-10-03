package com.college.eventmanagement.service;

import com.college.eventmanagement.dto.EventRequest;
import com.college.eventmanagement.dto.EventResponse;
import com.college.eventmanagement.entity.Event;
import com.college.eventmanagement.entity.EventStatus;
import com.college.eventmanagement.entity.User;
import com.college.eventmanagement.exception.BadRequestException;
import com.college.eventmanagement.exception.ResourceNotFoundException;
import com.college.eventmanagement.repository.EventRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * All event-related business logic - create, read, update, delete, search.
 */
@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // ------------------------------------------------------------------
    // READ
    // ------------------------------------------------------------------

    /**
     * Search with optional filters. Any filter may be omitted (null/blank).
     *
     * This uses a JPA Specification - a small object that builds the WHERE
     * clause at runtime, so we do not need a separate repository method for
     * every possible combination of keyword / department / status.
     *
     * @param keyword    matches the title, venue or department (case-insensitive)
     * @param department exact department filter
     * @param status     exact status filter
     * @param upcomingOnly when true, only events on or after today
     */
    @Transactional(readOnly = true)
    public List<EventResponse> search(String keyword, String department,
                                      String status, boolean upcomingOnly) {

        Specification<Event> spec = (root, query, cb) -> {
            List<Predicate> and = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                and.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("venue")), like),
                        cb.like(cb.lower(root.get("department")), like),
                        cb.like(cb.lower(root.get("organizer")), like)
                ));
            }
            if (department != null && !department.isBlank()
                    && !"ALL".equalsIgnoreCase(department)) {
                and.add(cb.equal(root.get("department"), department.trim()));
            }
            if (status != null && !status.isBlank()
                    && !"ALL".equalsIgnoreCase(status)) {
                and.add(cb.equal(root.get("status"), parseStatus(status)));
            }
            if (upcomingOnly) {
                and.add(cb.greaterThanOrEqualTo(root.get("eventDate"), LocalDate.now()));
            }
            return and.isEmpty() ? cb.conjunction()
                    : cb.and(and.toArray(new Predicate[0]));
        };

        return eventRepository.findAll(spec).stream()
                .sorted((a, b) -> {
                    int byDate = a.getEventDate().compareTo(b.getEventDate());
                    return byDate != 0 ? byDate
                            : a.getEventTime().compareTo(b.getEventTime());
                })
                .map(e -> EventResponse.from(e, isRegistrationPossible(e)))
                .toList();
    }

    /** GET /api/events/{id} */
    @Transactional(readOnly = true)
    public EventResponse findById(Long id) {
        Event event = getEntity(id);
        return EventResponse.from(event, isRegistrationPossible(event));
    }

    /** Used internally and by the registration service. */
    public Event getEntity(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    /** Distinct department names - powers the filter dropdown. */
    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        return eventRepository.findAll().stream()
                .map(Event::getDepartment)
                .filter(d -> d != null && !d.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    public List<EventStatus> getAllStatuses() {
        return List.of(EventStatus.values());
    }

    // ------------------------------------------------------------------
    // CREATE / UPDATE / DELETE  (admin only - enforced by the interceptor)
    // ------------------------------------------------------------------

    @Transactional
    public EventResponse create(EventRequest request, User admin) {

        validate(request);

        Event event = new Event();
        applyRequest(event, request);
        event.setCreatedBy(admin);
        event.setStatus(parseStatusOrDefault(request.getStatus()));

        Event saved = eventRepository.save(event);
        return EventResponse.from(saved, isRegistrationPossible(saved));
    }

    @Transactional
    public EventResponse update(Long id, EventRequest request) {

        validate(request);

        Event event = getEntity(id);
        applyRequest(event, request);
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            event.setStatus(parseStatus(request.getStatus()));
        }

        Event saved = eventRepository.save(event);
        return EventResponse.from(saved, isRegistrationPossible(saved));
    }

    @Transactional
    public void delete(Long id) {
        Event event = getEntity(id);
        // registrations are removed automatically (CascadeType.ALL)
        eventRepository.delete(event);
    }

    // ------------------------------------------------------------------
    // housekeeping
    // ------------------------------------------------------------------

    /**
     * Any OPEN event whose deadline has passed becomes CLOSED.
     * Called before every event listing so the status is always fresh.
     */
    @Transactional
    public void closeExpiredEvents() {
        List<Event> expired = eventRepository.findExpiredOpenEvents(
                EventStatus.OPEN, LocalDate.now());
        for (Event event : expired) {
            event.setStatus(EventStatus.CLOSED);
        }
        if (!expired.isEmpty()) {
            eventRepository.saveAll(expired);
        }
    }

    /**
     * Can a student register for this event right now?
     * Requires: status OPEN, deadline not passed, and seats remaining.
     */
    public boolean isRegistrationPossible(Event event) {
        return event.getStatus() == EventStatus.OPEN
                && !event.isDeadlinePassed()
                && event.getSeatsLeft() > 0;
    }

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    /** Copies the request fields onto the entity. */
    private void applyRequest(Event event, EventRequest request) {
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription() == null
                ? null : request.getDescription().trim());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setVenue(request.getVenue().trim());
        event.setDepartment(request.getDepartment() == null
                ? null : request.getDepartment().trim());
        event.setOrganizer(request.getOrganizer() == null
                ? null : request.getOrganizer().trim());
        event.setCapacity(request.getCapacity());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
    }

    /**
     * Extra checks that a single annotation cannot express:
     * the deadline must not be after the event itself, and the event
     * must still be in the future.
     */
    private void validate(EventRequest request) {
        if (request.getEventDate() != null && request.getRegistrationDeadline() != null
                && request.getRegistrationDeadline().isAfter(request.getEventDate())) {
            throw new BadRequestException(
                    "The registration deadline cannot be after the event date.");
        }
        if (request.getEventDate() != null
                && request.getEventDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("The event date cannot be in the past.");
        }
    }

    private EventStatus parseStatus(String status) {
        try {
            return EventStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unknown event status: " + status);
        }
    }

    private EventStatus parseStatusOrDefault(String status) {
        return (status == null || status.isBlank())
                ? EventStatus.OPEN
                : parseStatus(status);
    }
}
