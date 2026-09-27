package com.bytepath.controller;

import com.bytepath.dto.request.GoogleAccessTokenRequest;
import com.bytepath.dto.request.GoogleCredentialRequest;
import com.bytepath.dto.request.RefreshTokenRequest;
import com.bytepath.dto.response.AuthResponse;
import com.bytepath.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Authentication REST controller.
 * Exposes standardized, input-validated authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register, login, token refresh, and OAuth endpoints")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Refresh expired JWT using valid refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Processing token refresh request");
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken().trim()));
    }

    @Operation(summary = "Direct administrator console sign-in")
    @PostMapping("/admin-access")
    public ResponseEntity<AuthResponse> adminAccess() {
        log.info("Processing direct administrator console authentication");
        return ResponseEntity.ok(authService.loginAsAdmin());
    }

    @Operation(summary = "Login or register via Google OAuth credential token")
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleCredentialRequest request) {
        log.info("Processing Google OAuth credential authentication");
        return ResponseEntity.ok(authService.loginWithGoogleCredential(request.getCredential().trim()));
    }

    @Operation(summary = "Login or register via Google OAuth access token")
    @PostMapping("/google/access-token")
    public ResponseEntity<AuthResponse> googleAccessToken(@Valid @RequestBody GoogleAccessTokenRequest request) {
        log.info("Processing Google OAuth access token authentication");
        return ResponseEntity.ok(authService.loginWithGoogleAccessToken(request.getAccessToken().trim()));
    }

    @Operation(summary = "Initiate GitHub OAuth 2.0 authorization redirect")
    @GetMapping("/github/start")
    public ResponseEntity<Void> githubStart() {
        log.info("Initiating GitHub OAuth redirect");
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authService.githubAuthorizationUrl()))
                .build();
    }

    @Operation(summary = "Handle GitHub OAuth 2.0 authorization callback")
    @GetMapping("/github/callback")
    public ResponseEntity<Void> githubCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error) {
        if (error != null || code == null || code.isBlank()) {
            log.warn("GitHub OAuth callback aborted or error: {}", error);
            return redirect("error=" + encode(error == null ? "GitHub sign-in was cancelled." : error));
        }
        try {
            log.info("Completing GitHub OAuth code exchange");
            AuthResponse session = authService.loginWithGithub(code);
            String fragment = "token=" + encode(session.getToken())
                    + "&loginId=" + encode(session.getLoginId())
                    + "&name=" + encode(session.getName())
                    + "&email=" + encode(session.getEmail())
                    + "&role=" + encode(session.getRole());
            return redirect(fragment);
        } catch (RuntimeException ex) {
            log.error("GitHub sign-in failed during exchange: {}", ex.getMessage());
            return redirect("error=" + encode(ex.getMessage() == null ? "GitHub sign-in failed." : ex.getMessage()));
        }
    }

    private ResponseEntity<Void> redirect(String fragment) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "#" + fragment))
                .build();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
