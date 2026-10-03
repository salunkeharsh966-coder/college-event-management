package com.college.eventmanagement.dto;

import com.college.eventmanagement.entity.Registration;
import com.college.eventmanagement.entity.RegistrationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * One row of the student dashboard / admin registration table.
 * It flattens the Registration + User + Event data into a single object
 * so the React table can render it without extra requests.
 */
public class RegistrationResponse {

    private Long id;

    // ---- student ----
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentCourse;
    private String studentRollNumber;

    // ---- event ----
    private Long eventId;
    private String eventTitle;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venue;
    private String department;
    private String organizer;

    // ---- registration ----
    private RegistrationStatus status;
    private LocalDateTime registeredAt;

    public RegistrationResponse() { }

    public static RegistrationResponse from(Registration reg) {
        RegistrationResponse dto = new RegistrationResponse();
        dto.id = reg.getId();
        dto.status = reg.getStatus();
        dto.registeredAt = reg.getRegisteredAt();

        if (reg.getUser() != null) {
            dto.studentId = reg.getUser().getId();
            dto.studentName = reg.getUser().getFullName();
            dto.studentEmail = reg.getUser().getEmail();
            dto.studentPhone = reg.getUser().getPhone();
            dto.studentCourse = reg.getUser().getCourse();
            dto.studentRollNumber = reg.getUser().getRollNumber();
        }

        if (reg.getEvent() != null) {
            dto.eventId = reg.getEvent().getId();
            dto.eventTitle = reg.getEvent().getTitle();
            dto.eventDate = reg.getEvent().getEventDate();
            dto.eventTime = reg.getEvent().getEventTime();
            dto.venue = reg.getEvent().getVenue();
            dto.department = reg.getEvent().getDepartment();
            dto.organizer = reg.getEvent().getOrganizer();
        }
        return dto;
    }

    // ---------------- getters and setters ----------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentPhone() { return studentPhone; }
    public void setStudentPhone(String studentPhone) { this.studentPhone = studentPhone; }

    public String getStudentCourse() { return studentCourse; }
    public void setStudentCourse(String studentCourse) { this.studentCourse = studentCourse; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

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

    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
}
