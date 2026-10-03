package com.college.eventmanagement.repository;

import com.college.eventmanagement.entity.Event;
import com.college.eventmanagement.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Database access for the events table.
 *
 * JpaSpecificationExecutor lets us build a dynamic search query
 * (keyword + department + status) without writing one method per
 * combination. See EventService.search().
 */
@Repository
public interface EventRepository
        extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    List<Event> findByStatusOrderByEventDateAsc(EventStatus status);

    List<Event> findAllByOrderByEventDateAsc();

    /** Events on or after today, soonest first - used by the student home page. */
    List<Event> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);

    long countByStatus(EventStatus status);

    /**
     * Events whose registration deadline has passed but that are still
     * marked OPEN, so the service can flip them to CLOSED automatically.
     * The status is passed as an enum parameter (see the note in
     * RegistrationRepository for why this is safer than a literal).
     */
    @Query("""
           SELECT e FROM Event e
            WHERE e.status = :status
              AND e.registrationDeadline < :today
           """)
    List<Event> findExpiredOpenEvents(@Param("status") EventStatus status,
                                      @Param("today") LocalDate today);
}
