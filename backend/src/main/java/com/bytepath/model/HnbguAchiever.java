package com.bytepath.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "hnbgu_achievers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HnbguAchiever {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private String batch;

    private String cgpa;

    @Column(name = "achievement_title", nullable = false)
    private String achievementTitle;

    @Column(columnDefinition = "TEXT")
    private String quote;

    @Column(name = "company_or_exam")
    private String companyOrExam;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "badge_label")
    @Builder.Default
    private String badgeLabel = "STAR ACHIEVER";

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
