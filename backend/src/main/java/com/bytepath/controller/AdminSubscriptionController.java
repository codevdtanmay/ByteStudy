package com.bytepath.controller;

import com.bytepath.dto.request.GrantSubscriptionRequest;
import com.bytepath.dto.request.UpdatePromotionRequest;
import com.bytepath.dto.response.PromotionResponse;
import com.bytepath.dto.response.SubscriptionAdminResponse;
import com.bytepath.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Admin controls for subscriptions, promotional offers, and student access")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionController {

    private final PromotionService promotionService;

    public AdminSubscriptionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Operation(summary = "Update promotional offers, discounts, and free semesters (ADMIN only)")
    @PostMapping("/promotions")
    public ResponseEntity<PromotionResponse> updatePromotions(@Valid @RequestBody UpdatePromotionRequest request) {
        return ResponseEntity.ok(promotionService.updatePromotion(request));
    }

    @Operation(summary = "Manually grant subscription to a user by email (ADMIN only)")
    @PostMapping("/subscriptions/grant")
    public ResponseEntity<SubscriptionAdminResponse> grantSubscription(@Valid @RequestBody GrantSubscriptionRequest request) {
        return ResponseEntity.ok(promotionService.grantSubscription(request));
    }

    @Operation(summary = "Revoke subscription from a user by email (ADMIN only)")
    @PostMapping("/subscriptions/revoke")
    public ResponseEntity<Map<String, Object>> revokeSubscription(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        promotionService.revokeSubscription(email);
        return ResponseEntity.ok(Map.of("success", true, "message", "Subscription revoked for " + email));
    }

    @Operation(summary = "List all recent student subscriptions (ADMIN only)")
    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionAdminResponse>> listSubscriptions() {
        return ResponseEntity.ok(promotionService.getAllSubscriptions());
    }
}
