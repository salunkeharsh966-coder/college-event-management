package com.college.eventmanagement.service;

import com.college.eventmanagement.dto.DashboardStat;
import com.college.eventmanagement.dto.DashboardStatsResponse;
import com.college.eventmanagement.dto.DashboardStatsResponse.EventFillLevel;
import com.college.eventmanagement.dto.RegistrationResponse;
import com.college.eventmanagement.entity.*;
import com.college.eventmanagement.exception.BadRequestException;
import com.college.eventmanagement.exception.ResourceNotFoundException;
import com.college.eventmanagement.repository.EventRepository;
import com.college.eventmanagement.repository.RegistrationRepository;
import com.college.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Business logic for event registrations and for the admin dashboard.
 */
@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventService eventService;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository,
                               EventService eventService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.eventService = eventService;
    }

    // ------------------------------------------------------------------
    // STUDENT ACTIONS
    // ------------------------------------------------------------------

    /**
     * POST /api/registrations
     * A student registers for an event.
     *
     * Every rule that could reject the request is checked here, with a
     * message the student can actually understand:
     *   1. the student exists and has the STUDENT role
     *   2. the event exists
     *   3. registration is currently open (status + deadline)
     *   4. there is still a seat available
     *   5. the student has not already registered
     */
    @Transactional
    public RegistrationResponse register(Long userId, Long eventId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only students can register for events.");
        }

        Event event = eventService.getEntity(eventId);

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BadRequestException("This event has been cancelled.");
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new BadRequestException("This event has already been completed.");
        }
        if (event.getStatus() == EventStatus.CLOSED) {
            throw new BadRequestException(
                    "Registration for this event is closed.");
        }
        if (event.isDeadlinePassed()) {
            throw new BadRequestException(
                    "The registration deadline for this event has passed.");
        }
        if (event.getSeatsLeft() <= 0) {
            throw new BadRequestException(
                    "Sorry, this event is full. All " + event.getCapacity()
                            + " seats have been taken.");
        }
        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new BadRequestException(
                    "You have already registered for this event.");
        }

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.CONFIRMED);

        Registration saved = registrationRepository.save(registration);
        return RegistrationResponse.from(saved);
    }

    /** GET /api/registrations/my/{userId} - the student dashboard list. */
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getMyRegistrations(Long userId) {
        return registrationRepository.findByUserIdOrderByRegisteredAtDesc(userId)
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    /**
     * DELETE /api/registrations/{id}/cancel?userId=...
     * A student cancels their own registration.
     * The row is kept and marked CANCELLED so the record is not lost.
     */
    @Transactional
    public void cancelByStudent(Long registrationId, Long userId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration", registrationId));

        if(!registration.getUser().getId().equals(userId)) {
            throw new BadRequestException(
                    "You can cancel only your own registrations.");
        }
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException(
                    "This registration is already cancelled.");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    // ------------------------------------------------------------------
    // ADMIN ACTIONS
    // ------------------------------------------------------------------

    /** GET /api/admin/registrations - every registration in the system. */
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getAllRegistrations() {
        return registrationRepository.findAllWithDetails()
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    /** GET /api/admin/events/{eventId}/registrations */
    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsForEvent(Long eventId) {
        return registrationRepository.findByEventIdOrderByRegisteredAtAsc(eventId)
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    /** PUT /api/admin/registrations/{id}/status?value=ATTENDED */
    @Transactional
    public RegistrationResponse updateStatus(Long registrationId, String status) {

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration", registrationId));

        RegistrationStatus newStatus;
        try {
            newStatus = RegistrationStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException(
                    "Unknown registration status: " + status
                            + ". Allowed values: CONFIRMED, CANCELLED, ATTENDED.");
        }

        registration.setStatus(newStatus);
        return RegistrationResponse.from(registrationRepository.save(registration));
    }

    /** DELETE /api/admin/registrations/{id} */
    @Transactional
    public void deleteRegistration(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registration", registrationId));
        registrationRepository.delete(registration);
    }

    // ------------------------------------------------------------------
    // DASHBOARD STATISTICS
    // ------------------------------------------------------------------

    /**
     * GET /api/admin/dashboard
     *
     * Returns the four KPI cards, a bar chart of registrations per event,
     * a chart of registrations per department, and the fill-level of each
     * event for the progress bars.
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {

        eventService.closeExpiredEvents();

        List<Event> events = eventRepository.findAllByOrderByEventDateAsc();
        List<Registration> allRegistrations = registrationRepository.findAll();

        // ---- working out the numbers ----
        long totalEvents = events.size();
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalRegistrations = allRegistrations.stream()
                .filter(r -> r.getStatus() != RegistrationStatus.CANCELLED)
                .count();
        long openEvents = events.stream()
                .filter(e -> e.getStatus() == EventStatus.OPEN)
                .count();

        // ---- KPI cards ----
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.getStatistics().add(new DashboardStat(
                "Total Events", totalEvents, "calendar",
                openEvents + " currently open for registration"));
        response.getStatistics().add(new DashboardStat(
                "Registered Students", totalStudents, "people",
                "Student accounts on the portal"));
        response.getStatistics().add(new DashboardStat(
                "Total Registrations", totalRegistrations, "clipboard-check",
                "Excludes cancelled entries"));
        response.getStatistics().add(new DashboardStat(
                "Open Events", openEvents, "unlock",
                "Accepting registrations today"));

        // ---- bar chart: registrations per event ----
        List<Object[]> perEvent = registrationRepository.countRegistrationsPerEvent(
                RegistrationStatus.CANCELLED);
        for (Object[] row : perEvent) {
            response.getChartLabels().add((String) row[0]);
            response.getChartValues().add((Long) row[1]);
        }

        // ---- bar chart: registrations per department ----
        List<Object[]> perDepartment =
                registrationRepository.countRegistrationsPerDepartment(
                        RegistrationStatus.CANCELLED);
        for (Object[] row : perDepartment) {
            response.getDepartmentLabels().add(
                    row[0] == null ? "Not specified" : (String) row[0]);
            response.getDepartmentValues().add((Long) row[1]);
        }

        // ---- fill level of each event ----
        List<EventFillLevel> fillLevels = new ArrayList<>();
        for (Event event : events) {
            fillLevels.add(new EventFillLevel(
                    event.getTitle(),
                    event.getRegisteredCount(),
                    event.getCapacity()));
        }
        // fullest events first - most useful for an administrator
        fillLevels.sort(Comparator.comparingInt(EventFillLevel::getPercent).reversed());
        response.setFillLevels(fillLevels);

        return response;
    }
}
