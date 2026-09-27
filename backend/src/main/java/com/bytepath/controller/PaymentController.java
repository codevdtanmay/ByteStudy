package com.bytepath.controller;

import com.bytepath.model.User;
import com.bytepath.dto.request.PaymentOrderRequest;
import jakarta.validation.Valid;
import com.bytepath.service.RazorpayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final RazorpayService razorpay;
    public PaymentController(RazorpayService razorpay) { this.razorpay = razorpay; }

    @PostMapping("/razorpay/order")
    public ResponseEntity<Map<String, Object>> order(@AuthenticationPrincipal User user,
                                                      @Valid @RequestBody PaymentOrderRequest request) {
        return ResponseEntity.ok(razorpay.createOrder(user, request.plan(), "bytepath-" + System.currentTimeMillis()));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Map<String, Object>> verify(@AuthenticationPrincipal User user,
                                                       @RequestBody Map<String, String> body) {
        var subscription = razorpay.verifyPayment(user, body.get("razorpay_order_id"),
            body.get("razorpay_payment_id"), body.get("razorpay_signature"));
        user.setHasEndSemSubscription(true);
        return ResponseEntity.ok(Map.of("verified", true, "subscriptionId", subscription.getId()));
    }

    @PostMapping("/razorpay/webhook")
    public ResponseEntity<Void> webhook(@RequestHeader("X-Razorpay-Signature") String signature,
                                         @RequestBody String payload) {
        // Webhook reconciliation is deliberately idempotent. Unknown payments are
        // rejected instead of granting access without a matching local order.
        String paymentId = payload.replaceFirst("(?s).*\\\"payment_id\\\"\\s*:\\s*\\\"([^\"]+)\\\".*", "$1");
        razorpay.processWebhook(payload, signature, paymentId);
        return ResponseEntity.ok().build();
    }
}
