package com.bytepath.service;

import com.bytepath.dto.response.AuthResponse;
import com.bytepath.model.User;
import com.bytepath.repository.UserRepository;
import com.bytepath.repository.RefreshTokenRepository;
import com.bytepath.model.RefreshToken;
import com.bytepath.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.security.SecureRandom;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.Map;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.security.MessageDigest;

/**
 * Authentication service — handles OAuth sign-in and session creation.
 * <p>
 * Provider secrets stay on the backend; application sessions are persisted in the database.
 */
@Service
public class AuthService {

    private static final String ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository    userRepo;
    private final JwtTokenProvider  jwtProvider;
    private final RefreshTokenRepository refreshTokens;
    private final String googleClientId;
    private final String githubClientId;
    private final String githubClientSecret;
    private final String githubCallbackUrl;

    public AuthService(UserRepository userRepo,
                       JwtTokenProvider jwtProvider,
                       RefreshTokenRepository refreshTokens,
                       @Value("${google.client-id:}") String googleClientId,
                       @Value("${github.client-id:}") String githubClientId,
                       @Value("${github.client-secret:}") String githubClientSecret,
                       @Value("${github.callback-url:}") String githubCallbackUrl) {
        this.userRepo        = userRepo;
        this.jwtProvider     = jwtProvider;
        this.refreshTokens = refreshTokens;
        this.googleClientId  = googleClientId;
        this.githubClientId  = githubClientId;
        this.githubClientSecret = githubClientSecret;
        this.githubCallbackUrl = githubCallbackUrl;
    }

    @Transactional
    public AuthResponse refresh(String rawToken) {
        RefreshToken stored = refreshTokens.findByTokenHash(hash(rawToken)).orElseThrow(() -> new SecurityException("Refresh token is invalid."));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) throw new SecurityException("Refresh token is expired.");
        stored.setRevoked(true); refreshTokens.save(stored);
        return buildResponse(stored.getUser());
    }

    // ── Google OAuth (profile-based, for local dev / demo) ────────────────────

    @Transactional
    public AuthResponse loginWithGoogle(String name, String email) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanName  = (name != null && !name.isBlank()) ? name.trim() : "Google Scholar";

        User user = userRepo.findByEmail(cleanEmail).orElseGet(() -> {
            User newUser = User.builder()
                .loginId(generateLoginId())
                .name(cleanName)
                .email(cleanEmail)
                .role(User.Role.STUDENT)
                .googleAuth(true)
                .oauthProvider("GOOGLE")
                .emailVerified(true)
                .build();
            return userRepo.save(newUser);
        });

        return buildResponse(user);
    }

    @Transactional
    public AuthResponse loginWithGoogleCredential(String credential) {
        if (googleClientId.isBlank()) {
            throw new IllegalArgumentException("Google OAuth is not configured on the backend.");
        }

        Map<String, Object> claims;
        try {
            claims = RestClient.create()
                .get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("oauth2.googleapis.com")
                    .path("/tokeninfo")
                    .queryParam("id_token", credential)
                    .build())
                .retrieve()
                .body(Map.class);
        } catch (RestClientException exception) {
            throw new IllegalArgumentException("Google could not validate this sign-in. Please try again.");
        }

        String issuer = claims == null ? "" : String.valueOf(claims.get("iss"));
        String email = claims == null ? "" : String.valueOf(claims.getOrDefault("email", ""));
        boolean emailVerified = claims != null
            && Boolean.parseBoolean(String.valueOf(claims.get("email_verified")));
        boolean validIssuer = "https://accounts.google.com".equals(issuer)
            || "accounts.google.com".equals(issuer);

        if (claims == null
            || !googleClientId.equals(String.valueOf(claims.get("aud")))
            || !validIssuer
            || !emailVerified
            || email.isBlank()) {
            throw new IllegalArgumentException("Google credential is invalid for this application.");
        }

        return loginWithGoogle(
            String.valueOf(claims.getOrDefault("name", "Google Scholar")),
            email
        );
    }

    @Transactional
    public AuthResponse loginWithGoogleAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException("Google access token is missing.");
        }

        Map<String, Object> profile;
        try {
            profile = RestClient.builder()
                .baseUrl("https://openidconnect.googleapis.com")
                .defaultHeader("Authorization", "Bearer " + accessToken)
                .defaultHeader("Accept", "application/json")
                .build()
                .get().uri("/v1/userinfo")
                .retrieve().body(Map.class);
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException(
                "Google rejected the sign-in token (HTTP " + ex.getStatusCode().value()
                    + "). Please try Google sign-in again.");
        } catch (RestClientException ex) {
            throw new IllegalArgumentException(
                "Google sign-in could not be verified right now. Please try again.");
        }

        if (profile == null || !Boolean.parseBoolean(String.valueOf(profile.getOrDefault("email_verified", false)))) {
            throw new IllegalArgumentException("Google did not return a verified email address.");
        }
        String email = String.valueOf(profile.getOrDefault("email", "")).trim();
        if (email.isBlank() || "null".equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Google did not return an email address for this account.");
        }
        return loginWithGoogle(
            String.valueOf(profile.getOrDefault("name", "Google Scholar")),
            email
        );
    }

    public String githubAuthorizationUrl() {
        if (githubClientId.isBlank() || githubClientSecret.isBlank()) {
            throw new IllegalArgumentException("GitHub OAuth is not configured on the backend.");
        }
        return "https://github.com/login/oauth/authorize?client_id=" + encode(githubClientId)
            + "&redirect_uri=" + encode(githubCallbackUrl)
            + "&scope=" + encode("read:user user:email");
    }

    @Transactional
    public AuthResponse loginWithGithub(String code) {
        if (githubClientId.isBlank() || githubClientSecret.isBlank()) {
            throw new IllegalArgumentException("GitHub OAuth is not configured on the backend.");
        }

        Map<String, Object> tokenResponse = RestClient.create()
            .post()
            .uri("https://github.com/login/oauth/access_token")
            .header("Accept", "application/json")
            .header("Content-Type", "application/x-www-form-urlencoded")
            .header("User-Agent", "ByteStudy-Backend")
            .body("client_id=" + encode(githubClientId) + "&client_secret=" + encode(githubClientSecret)
                + "&code=" + encode(code) + "&redirect_uri=" + encode(githubCallbackUrl))
            .retrieve()
            .body(Map.class);

        String accessToken = tokenResponse == null ? "" : String.valueOf(tokenResponse.getOrDefault("access_token", ""));
        if (accessToken.isBlank()) throw new IllegalArgumentException("GitHub authorization could not be completed.");

        RestClient github = RestClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader("Authorization", "Bearer " + accessToken)
            .defaultHeader("Accept", "application/vnd.github+json")
            .defaultHeader("User-Agent", "ByteStudy-Backend")
            .build();
        Map profile = github.get().uri("/user").retrieve().body(Map.class);
        String email = profile == null ? "" : String.valueOf(profile.getOrDefault("email", ""));
        if (email.isBlank() || "null".equalsIgnoreCase(email)) {
            java.util.List<Map> emails = github.get().uri("/user/emails").retrieve().body(java.util.List.class);
            if (emails != null) {
                email = emails.stream()
                    .filter(item -> Boolean.TRUE.equals(item.get("primary")) && Boolean.TRUE.equals(item.get("verified")))
                    .map(item -> String.valueOf(item.get("email"))).findFirst().orElse("");
            }
        }
        if (email.isBlank()) throw new IllegalArgumentException("Your GitHub account does not expose a verified email address.");

        String name = profile == null ? "GitHub Scholar" : String.valueOf(profile.getOrDefault("name", profile.getOrDefault("login", "GitHub Scholar")));
        String cleanEmail = email.trim().toLowerCase();
        User user = userRepo.findByEmail(cleanEmail).orElseGet(() -> userRepo.save(User.builder()
            .loginId(generateLoginId()).name(name).email(cleanEmail)
            .role(User.Role.STUDENT).oauthProvider("GITHUB").emailVerified(true).build()));
        return buildResponse(user);
    }

    private String encode(String value) { return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8); }

    // ── UserDetailsService helper ──────────────────────────────────────────────

    public User loadUserByLoginId(String loginId) {
        return userRepo.findByLoginId(loginId)
            .orElseThrow(() ->
                new IllegalArgumentException("User not found: " + loginId));
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private AuthResponse buildResponse(User user) {
        String token = jwtProvider.generateToken(user.getLoginId());
        String refresh = Base64.getUrlEncoder().withoutPadding().encodeToString(java.security.SecureRandom.getSeed(48));
        refreshTokens.save(RefreshToken.builder().user(user).tokenHash(hash(refresh)).expiresAt(Instant.now().plusSeconds(60L * 60 * 24 * 30)).revoked(false).build());
        return AuthResponse.builder()
            .token(token)
            .loginId(user.getLoginId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .refreshToken(refresh)
            .isOnboarded(user.isOnboarded())
            .targetCgpa(user.getTargetCgpa())
            .build();
    }

    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception ex) { throw new IllegalStateException(ex); }
    }

    /**
     * Generates a unique login ID in the format BTP-YYYY-XXXXXX.
     * Matches the JavaScript createUniqueLoginId() function.
     */
    private String generateLoginId() {
        int year = Year.now().getValue();
        String candidate;
        do {
            candidate = "BTP-" + year + "-" + randomSegment();
        } while (userRepo.existsByLoginId(candidate));
        return candidate;
    }

    private String randomSegment() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(ID_ALPHABET.charAt(RANDOM.nextInt(ID_ALPHABET.length())));
        }
        return sb.toString();
    }

}
