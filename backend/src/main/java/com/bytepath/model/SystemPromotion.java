package com.bytepath.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "system_promotions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemPromotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "banner_headline")
    @Builder.Default
    private String bannerHeadline = "Special Offer for You All! Up to 50% OFF on all End-Sem Passes";

    @Column(name = "discount_percentage", nullable = false)
    @Builder.Default
    private Integer discountPercentage = 50;

    @Column(name = "free_semesters")
    @Builder.Default
    private String freeSemesters = "";

    @Column(name = "free_trial_active", nullable = false)
    @Builder.Default
    private boolean freeTrialActive = false;

    @Column(name = "free_trial_days", nullable = false)
    @Builder.Default
    private Integer freeTrialDays = 5;

    @Column(name = "free_trial_expires_at")
    private Instant freeTrialExpiresAt;

    @Column(name = "badge_text")
    @Builder.Default
    private String badgeText = "LIMITED TIME OFFER";

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    public Set<Integer> parseFreeSemesters() {
        if (freeSemesters == null || freeSemesters.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(freeSemesters.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> {
                try {
                    return Integer.parseInt(s);
                } catch (NumberFormatException e) {
                    return null;
                }
            })
            .filter(s -> s != null)
            .collect(Collectors.toSet());
    }

    public boolean isSemesterFree(int semesterNumber) {
        if (!active) {
            return false;
        }
        if (freeTrialActive && (freeTrialExpiresAt == null || freeTrialExpiresAt.isAfter(Instant.now()))) {
            return true;
        }
        return parseFreeSemesters().contains(semesterNumber);
    }
}
