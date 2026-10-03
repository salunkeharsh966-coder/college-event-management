package com.college.eventmanagement.config;

import com.college.eventmanagement.entity.Role;
import com.college.eventmanagement.entity.User;
import com.college.eventmanagement.exception.BadRequestException;
import com.college.eventmanagement.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * A small role check for the /api/admin/** endpoints.
 *
 * HOW IT WORKS
 *   1. After login the React app stores the logged-in user in localStorage.
 *   2. The axios client sends the user's id in an "X-User-Id" header.
 *   3. This interceptor loads that user and rejects the request unless the
 *      role is ADMIN.
 *
 * This is deliberately simple so it can be explained in a viva. A real
 * production system would verify a signed JWT instead of trusting a header,
 * because a header can be forged. The project keeps the header approach to
 * stay within the 3-day scope and to avoid adding Spring Security config.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER = "currentUser";

    private final UserRepository userRepository;

    public AuthInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        // Let the browser's CORS preflight request through.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String header = request.getHeader("X-User-Id");
        if (header == null || header.isBlank()) {
            throw new BadRequestException(
                    "You must be logged in as an administrator to do this.");
        }

        Long userId;
        try {
            userId = Long.parseLong(header.trim());
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Invalid user id in request header.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException(
                        "Logged-in user no longer exists. Please log in again."));

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException(
                    "Access denied. This action is available to administrators only.");
        }

        // Make the user available to the controller if it needs it.
        request.setAttribute(CURRENT_USER, user);
        return true;
    }
}
