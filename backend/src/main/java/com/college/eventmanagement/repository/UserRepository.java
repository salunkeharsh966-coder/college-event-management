package com.college.eventmanagement.repository;

import com.college.eventmanagement.entity.Role;
import com.college.eventmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Database access for the users table.
 * Spring Data JPA writes the SQL for us from the method names.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Used during login and during registration (duplicate e-mail check). */
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);
}
