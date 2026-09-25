package com.bytepath.controller;

import com.bytepath.dto.response.AuthResponse;
import com.bytepath.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Authentication REST controller.
 * <p>
 * All endpoints are public (no JWT required).
 * On success, returns a JWT + account details.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register, login, and Google OAuth endpoints")
public class AuthController {

    private final AuthService authService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.getOrDefault("refreshToken", "")));
    }

    /**
     * POST /api/auth/google
    * Body: { "credential": "<Google ID token>" }
     */
    @Operation(summary = "Login or register via Google OAuth profile")
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody Map<String, String> body) {
        String credential = body.getOrDefault("credential", "").trim();
        if (credential.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.loginWithGoogleCredential(credential));
    }

    @PostMapping("/google/access-token")
    public ResponseEntity<AuthResponse> googleAccessToken(@RequestBody Map<String, String> body) {
        String accessToken = body.getOrDefault("accessToken", "").trim();
        if (accessToken.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(authService.loginWithGoogleAccessToken(accessToken));
    }

    @GetMapping("/github/start")
    public ResponseEntity<Void> githubStart() {
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(authService.githubAuthorizationUrl())).build();
    }

    @GetMapping("/github/callback")
    public ResponseEntity<Void> githubCallback(@RequestParam(required = false) String code,
                                                @RequestParam(required = false) String error) {
        if (error != null || code == null || code.isBlank()) {
            return redirect("error=" + encode(error == null ? "GitHub sign-in was cancelled." : error));
        }
        try {
            AuthResponse session = authService.loginWithGithub(code);
            String fragment = "token=" + encode(session.getToken())
                + "&loginId=" + encode(session.getLoginId())
                + "&name=" + encode(session.getName())
                + "&email=" + encode(session.getEmail())
                + "&role=" + encode(session.getRole());
            return redirect(fragment);
        } catch (RuntimeException ex) {
            return redirect("error=" + encode(ex.getMessage() == null ? "GitHub sign-in failed." : ex.getMessage()));
        }
    }

    private ResponseEntity<Void> redirect(String fragment) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(frontendUrl + "#" + fragment)).build();
    }

    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
}
