package com.college.eventmanagement.dto;

import com.college.eventmanagement.entity.Role;

/**
 * What /api/auth/login returns after a successful password check.
 *
 * This is a simplified login for a college mini project: the server
 * returns the user details and the React app stores them in
 * localStorage. A production system would return a signed JWT here.
 */
public class AuthResponse {

    private String message;
    private Long userId;
    private String fullName;
    private String email;
    private Role role;

    public AuthResponse() { }

    public AuthResponse(String message, Long userId, String fullName,
                        String email, Role role) {
        this.message = message;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
