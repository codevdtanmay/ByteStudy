package com.bytepath.controller;

import com.bytepath.dto.request.LoginRequest;
import com.bytepath.dto.request.RegisterRequest;
import com.bytepath.dto.response.AuthResponse;
import com.bytepath.dto.response.SignupResponse;
import com.bytepath.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

    /** POST /api/auth/register — create a new student account */
    @Operation(summary = "Register a new BytePath account")
    @PostMapping("/register")
    public ResponseEntity<SignupResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyRegistration(body.getOrDefault("token", "")));
    }

    /** POST /api/auth/login — sign in with loginId/email + password */
    @Operation(summary = "Login with BytePath ID or email")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
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
