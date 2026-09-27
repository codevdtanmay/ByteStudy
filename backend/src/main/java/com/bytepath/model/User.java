package com.bytepath.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

/**
 * Represents a registered BytePath student (or admin) account.
 * <p>
 * loginId  — unique BTP-YYYY-XXXXXX identifier (or admin email)
 * email    — Google / registration email
 * role     — STUDENT (default) or ADMIN
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "login_id"),
    @UniqueConstraint(columnNames = "email")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique BytePath login identifier: BTP-YYYY-XXXXXX */
    @Column(name = "login_id", nullable = false, unique = true)
    private String loginId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    /** BCrypt-hashed password. Never stored in plain text and never exposed in JSON responses. */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "password_hash")
    private String passwordHash;

    /**
     * STUDENT or ADMIN.
     * Stored as a string enum for readability in the DB.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.STUDENT;

    /** Whether account was created via Google OAuth. */
    @Builder.Default
    @Column(name = "is_google_auth")
    private boolean googleAuth = false;

    @Column(name = "oauth_provider")
    private String oauthProvider;

    @Builder.Default
    @Column(name = "is_onboarded")
    private boolean onboarded = false;

    /** Target CGPA set by the student during onboarding. */
    @Builder.Default
    @Column(name = "target_cgpa")
    private Double targetCgpa = 8.50;

    @Builder.Default
    @Column(name = "monthly_budget")
    private Double monthlyBudget = 3000.0;

    @Builder.Default
    @Column(name = "has_end_sem_subscription")
    private boolean hasEndSemSubscription = false;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    // ── UserDetails interface ─────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Spring Security uses this field for authentication. Never exposed via serialization. */
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Override
    public String getPassword() { return passwordHash; }

    /** We use loginId as the Spring Security username. */
    @Override
    public String getUsername() { return loginId; }

    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return true; }

    // ── Role enum ─────────────────────────────────────────────────────────────

    public enum Role { STUDENT, ADMIN }
}
