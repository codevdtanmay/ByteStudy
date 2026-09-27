package com.bytepath.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private boolean active;
    private String bannerHeadline;
    private Integer discountPercentage;
    private String freeSemesters;
    private List<Integer> freeSemesterList;
    private boolean freeTrialActive;
    private Integer freeTrialDays;
    private Instant freeTrialExpiresAt;
    private String badgeText;
    private Instant updatedAt;
}
