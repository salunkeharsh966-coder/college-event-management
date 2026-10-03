package com.college.eventmanagement.repository;

import com.college.eventmanagement.entity.Registration;
import com.college.eventmanagement.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Database access for the registrations table.
 * Note the derived queries that walk across the relationships:
 * "findByUserIdAndEventId" -> registration.user.id and registration.event.id
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    /** A student's own registrations - powers the student dashboard. */
    List<Registration> findByUserIdOrderByRegisteredAtDesc(Long userId);

    /** The admin's "manage registrations" table for one event. */
    List<Registration> findByEventIdOrderByRegisteredAtAsc(Long eventId);

    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    long countByEventIdAndStatusNot(Long eventId, RegistrationStatus status);

    long countByStatus(RegistrationStatus status);

    /** All registrations joined with student and event details, newest first. */
    @Query("""
           SELECT r FROM Registration r
             JOIN FETCH r.user
             JOIN FETCH r.event
            ORDER BY r.registeredAt DESC
           """)
    List<Registration> findAllWithDetails();

    /**
     * Number of registrations per event, for the dashboard chart.
     *
     * The cancelled status is passed in as a parameter rather than written
     * as a literal inside the query, because comparing an enum path to a
     * string literal differs between Hibernate versions. Passing the enum
     * value of the correct type always works.
     */
    @Query("""
           SELECT r.event.title, COUNT(r)
             FROM Registration r
            WHERE r.status <> :excluded
            GROUP BY r.event.id, r.event.title
            ORDER BY COUNT(r) DESC
           """)
    List<Object[]> countRegistrationsPerEvent(@Param("excluded") RegistrationStatus excluded);

    /** Registrations per department, for the dashboard chart. */
    @Query("""
           SELECT r.event.department, COUNT(r)
             FROM Registration r
            WHERE r.event.department IS NOT NULL
              AND r.status <> :excluded
            GROUP BY r.event.department
            ORDER BY COUNT(r) DESC
           """)
    List<Object[]> countRegistrationsPerDepartment(@Param("excluded") RegistrationStatus excluded);
}
