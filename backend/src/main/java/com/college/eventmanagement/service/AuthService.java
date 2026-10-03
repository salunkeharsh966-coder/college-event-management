package com.college.eventmanagement.service;

import com.college.eventmanagement.dto.AuthResponse;
import com.college.eventmanagement.dto.LoginRequest;
import com.college.eventmanagement.dto.RegisterRequest;
import com.college.eventmanagement.entity.Role;
import com.college.eventmanagement.entity.User;
import com.college.eventmanagement.exception.BadRequestException;
import com.college.eventmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Handles student registration and login.
 *
 * Every registered user gets the STUDENT role. Admin accounts are created
 * directly in the database (see seed.sql) so that no visitor can promote
 * themselves to administrator.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** POST /api/auth/register */
    public AuthResponse register(RegisterRequest request) {

        // ---- manual validation with friendly messages ----
        if (isBlank(request.getFullName())) {
            throw new BadRequestException("Full name is required.");
        }
        if (isBlank(request.getEmail())) {
            throw new BadRequestException("Email address is required.");
        }
        if (isBlank(request.getPassword()) || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }
        if (!request.getEmail().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BadRequestException("Please enter a valid email address.");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException(
                    "An account with this email already exists. Please log in instead.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        // Never store the plain password - always store the BCrypt hash.
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(trimOrNull(request.getPhone()));
        user.setCourse(trimOrNull(request.getCourse()));
        user.setRollNumber(trimOrNull(request.getRollNumber()));
        user.setRole(Role.STUDENT);   // hard-coded: the client cannot choose a role

        User saved = userRepository.save(user);

        return new AuthResponse(
                "Registration successful. Please log in to continue.",
                saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole());
    }

    /** POST /api/auth/login */
    public AuthResponse login(LoginRequest request) {

        if (isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new BadRequestException("Email and password are both required.");
        }

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadRequestException(
                        "No account was found with this email address."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect password. Please try again.");
        }

        return new AuthResponse(
                "Login successful. Welcome back, " + user.getFullName() + "!",
                user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    /** Used by the frontend to refresh the profile after a page reload. */
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("User not found."));
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    // ---------------- helpers ----------------

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trimOrNull(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
