package com.college.eventmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the College Event Management backend.
 *
 * Run this class from your IDE (right click -> Run) or from the terminal:
 *     mvn spring-boot:run
 *
 * The REST API then listens on http://localhost:8080
 */
@SpringBootApplication
public class EventManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventManagementApplication.class, args);
        System.out.println("""

                =========================================================
                  College Event Management API is running
                  Base URL : http://localhost:8080
                  Health   : http://localhost:8080/api/events
                =========================================================
                """);
    }
}
