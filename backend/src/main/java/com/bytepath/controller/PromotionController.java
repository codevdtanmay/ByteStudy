package com.bytepath.controller;

import com.bytepath.dto.response.PromotionResponse;
import com.bytepath.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promotions")
@Tag(name = "Promotions", description = "Public promotional offers and free semester checks")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @Operation(summary = "Get active promotional offers and discounts (public)")
    @GetMapping("/active")
    public ResponseEntity<PromotionResponse> getActivePromotion() {
        return ResponseEntity.ok(promotionService.getCurrentPromotion());
    }
}
