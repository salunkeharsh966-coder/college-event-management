package com.college.eventmanagement.config;

import com.college.eventmanagement.entity.*;
import com.college.eventmanagement.repository.EventRepository;
import com.college.eventmanagement.repository.RegistrationRepository;
import com.college.eventmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Creates demo data the first time the application starts with an EMPTY
 * database, so the project is ready to demo immediately even if you did not
 * run seed.sql manually.
 *
 * If the users table already has rows this class does nothing, so it will
 * never overwrite your own data or create duplicates on the second run.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      EventRepository eventRepository,
                      RegistrationRepository registrationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (userRepository.count() > 0) {
            System.out.println("[DataSeeder] Database already has data - skipping seed.");
            return;
        }

        System.out.println("[DataSeeder] Empty database detected - inserting demo data...");

        // ---------------- admin ----------------
        User admin = newUser("Dr. Anjali Deshmukh", "admin@college.edu",
                "admin123", "9820011001", null, null, Role.ADMIN);

        // ---------------- students (all use password student123) ----------------
        User rahul = newUser("Rahul Sharma", "rahul@student.edu",
                "student123", "9820022002", "B.Sc. Computer Science",
                "CS2023001", Role.STUDENT);

        User sneha = newUser("Sneha Patil", "sneha@student.edu",
                "student123", "9820033003", "B.Sc. Information Technology",
                "IT2023004", Role.STUDENT);

        User amit = newUser("Amit Kulkarni", "amit@student.edu",
                "student123", "9820044004", "B.Sc. Computer Science",
                "CS2023012", Role.STUDENT);

        newUser("Priya Nair", "priya@student.edu",
                "student123", "9820055005", "B.Com.", "CM2023008", Role.STUDENT);

        // ---------------- events ----------------
        Event codeSprint = newEvent(
                "Code Sprint 2026",
                "A three-hour competitive programming contest covering data "
                        + "structures, algorithms and problem solving. Participants may "
                        + "use C, C++, Java or Python. Individual entry only.",
                10, LocalTime.of(10, 0), "Computer Lab 2, 3rd Floor",
                "Computer Science", "Prof. S. R. Joshi", 60, 7, EventStatus.OPEN, admin);

        Event bootcamp = newEvent(
                "Web Development Bootcamp",
                "A hands-on workshop where students build and deploy a small "
                        + "responsive website using HTML, CSS, JavaScript and Bootstrap. "
                        + "Bring your own laptop.",
                15, LocalTime.of(9, 30), "Seminar Hall A",
                "Computer Science", "Prof. M. A. Shaikh", 40, 12, EventStatus.OPEN, admin);

        newEvent("Tech Quiz Finals",
                "An inter-college quiz on computer fundamentals, emerging "
                        + "technology and general IT awareness. Teams of two.",
                20, LocalTime.of(11, 0), "Auditorium",
                "Information Technology", "Prof. K. V. Rao", 100, 18,
                EventStatus.OPEN, admin);

        newEvent("Robotics Exhibition",
                "Students display working robotics and IoT mini-projects. "
                        + "Open to all departments.",
                25, LocalTime.of(13, 0), "Ground Floor Exhibition Area",
                "Electronics", "Prof. D. P. More", 150, 22,
                EventStatus.UPCOMING, admin);

        newEvent("Annual Cultural Fest - Aarambh",
                "The college annual cultural festival with music, dance, drama "
                        + "and food stalls.",
                30, LocalTime.of(16, 0), "Main Campus Ground",
                "Student Council", "Cultural Secretary", 500, 26,
                EventStatus.UPCOMING, admin);

        Event seminar = newEvent("Career Guidance Seminar",
                "A seminar on internship and placement preparation, resume "
                        + "building and interview skills, conducted by alumni.",
                5, LocalTime.of(14, 0), "Seminar Hall B",
                "Placement Cell", "T&P Officer", 120, 3,
                EventStatus.OPEN, admin);

        newEvent("Hackathon 24H",
                "A twenty-four hour hackathon where teams of four build a "
                        + "working prototype for a given social problem.",
                40, LocalTime.of(8, 0), "Innovation Centre",
                "Computer Science", "Prof. S. R. Joshi", 80, 35,
                EventStatus.UPCOMING, admin);

        // ---------------- registrations ----------------
        register(rahul, codeSprint);
        register(rahul, bootcamp);
        register(sneha, codeSprint);
        register(amit, bootcamp);
        register(amit, seminar);

        System.out.println("[DataSeeder] Done.");
        System.out.println("[DataSeeder] Admin   : admin@college.edu   / admin123");
        System.out.println("[DataSeeder] Student : rahul@student.edu   / student123");
    }

    // ---------------- helpers ----------------

    private User newUser(String fullName, String email, String rawPassword,
                         String phone, String course, String rollNumber, Role role) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(phone);
        user.setCourse(course);
        user.setRollNumber(rollNumber);
        user.setRole(role);
        return userRepository.save(user);
    }

    private Event newEvent(String title, String description, int daysFromNow,
                           LocalTime time, String venue, String department,
                           String organizer, int capacity, int deadlineDaysFromNow,
                           EventStatus status, User admin) {
        Event event = new Event();
        event.setTitle(title);
        event.setDescription(description);
        event.setEventDate(LocalDate.now().plusDays(daysFromNow));
        event.setEventTime(time);
        event.setVenue(venue);
        event.setDepartment(department);
        event.setOrganizer(organizer);
        event.setCapacity(capacity);
        event.setRegistrationDeadline(LocalDate.now().plusDays(deadlineDaysFromNow));
        event.setStatus(status);
        event.setCreatedBy(admin);
        return eventRepository.save(event);
    }

    private void register(User student, Event event) {
        Registration registration = new Registration();
        registration.setUser(student);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registrationRepository.save(registration);
    }
}
