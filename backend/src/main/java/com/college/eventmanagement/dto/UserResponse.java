package com.college.eventmanagement.dto;

import com.college.eventmanagement.entity.Role;
import com.college.eventmanagement.entity.User;

/**
 * The user information the frontend is allowed to see.
 * Note there is no `password` field here - the hash never leaves the server.
 */
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String course;
    private String rollNumber;
    private Role role;

    public UserResponse() { }

    /** Converts an entity into a safe response object. */
    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.id = user.getId();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail();
        dto.phone = user.getPhone();
        dto.course = user.getCourse();
        dto.rollNumber = user.getRollNumber();
        dto.role = user.getRole();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
