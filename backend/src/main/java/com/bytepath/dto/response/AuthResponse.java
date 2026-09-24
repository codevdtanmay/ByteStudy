package com.bytepath.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Response body returned after successful authentication. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String loginId;
    private String name;
    private String email;
    private String role;
    private String refreshToken;
    private boolean isOnboarded;
    private Double targetCgpa;
}
