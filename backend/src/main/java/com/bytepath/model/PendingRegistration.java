package com.bytepath.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/** Registration details held until the user proves control of the email address. */
@Entity
@Table(name = "pending_registrations", indexes = {
    @Index(name = "idx_pending_registration_token", columnList = "token_hash", unique = true),
    @Index(name = "idx_pending_registration_email", columnList = "email", unique = true)
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PendingRegistration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "token_hash", nullable = false, unique = true, length = 128) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
}
