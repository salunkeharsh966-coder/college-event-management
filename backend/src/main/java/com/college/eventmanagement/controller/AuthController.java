package com.college.eventmanagement.controller;

import com.college.eventmanagement.dto.ApiResponse;
import com.college.eventmanagement.dto.AuthResponse;
import com.college.eventmanagement.dto.LoginRequest;
import com.college.eventmanagement.dto.RegisterRequest;
import com.college.eventmanagement.dto.UserResponse;
import com.college.eventmanagement.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints - open to everybody (no login needed).
 *
 *   POST /api/auth/register   -> create a STUDENT account
 *   POST /api/auth/login      -> check email + password
 *   GET  /api/auth/me/{id}    -> current profile (used after a page refresh)
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Create a new student account. Returns 201 Created. */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody RegisterRequest request) {

        AuthResponse result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(result.getMessage(), result));
    }

    /** Log in. Returns 200 on success, 400 with a message on failure. */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody LoginRequest request) {

        AuthResponse result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }

    /** Profile of the logged-in user. */
    @GetMapping("/me/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> me(@PathVariable Long id) {
        UserResponse user = UserResponse.from(authService.getById(id));
        return ResponseEntity.ok(ApiResponse.ok("Profile loaded", user));
    }
}
