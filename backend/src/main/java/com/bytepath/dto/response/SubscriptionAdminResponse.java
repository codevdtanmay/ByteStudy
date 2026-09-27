package com.bytepath.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionAdminResponse {
    private Long id;
    private String studentName;
    private String studentEmail;
    private String studentLoginId;
    private String plan;
    private String status;
    private String provider;
    private String providerPaymentId;
    private Instant startsAt;
    private Instant expiresAt;
    private Instant createdAt;
    private boolean active;
}
