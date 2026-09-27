package com.bytepath.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePromotionRequest {
    private boolean active;
    private String bannerHeadline;
    private Integer discountPercentage;
    private String freeSemesters;
    private boolean freeTrialActive;
    private Integer freeTrialDays;
    private String badgeText;
}
