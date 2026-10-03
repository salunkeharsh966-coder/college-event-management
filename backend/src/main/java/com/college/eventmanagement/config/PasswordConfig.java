package com.college.eventmanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Provides the PasswordEncoder bean used by AuthService.
 *
 * BCrypt hashes the password with a random salt and 10 rounds. The hash is
 * one-way, so even if somebody reads the users table they cannot recover the
 * original password - which is why seed.sql stores hashes and not plain text.
 */
@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
