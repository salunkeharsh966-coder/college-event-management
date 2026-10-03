package com.college.eventmanagement.dto;

/**
 * What the React app POSTs to /api/auth/register.
 * Using a DTO (instead of the User entity directly) means the client can
 * never set `role` or `id` itself - the server decides those.
 */
public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String course;
    private String rollNumber;

    public RegisterRequest() { }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
}
