package com.bytepath.service;

import com.bytepath.model.Subscription;
import com.bytepath.model.User;
import com.bytepath.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.web.client.RestClient;

@Service
public class RazorpayService {
    private final SubscriptionRepository subscriptions;
    private final String keySecret;
    private final String keyId;
    private final String webhookSecret;
    private final PromotionService promotions;
    private final long semesterPricePaise;
    private final long annualPricePaise;

    public RazorpayService(SubscriptionRepository subscriptions,
                           PromotionService promotions,
                           @Value("${razorpay.key-secret:}") String keySecret,
                           @Value("${razorpay.key-id:}") String keyId,
                           @Value("${razorpay.webhook-secret:}") String webhookSecret,
                           @Value("${razorpay.semester-price-inr:990}") long semesterPriceInr,
                           @Value("${razorpay.annual-price-inr:2990}") long annualPriceInr) {
        this.subscriptions = subscriptions;
        this.promotions = promotions;
        this.keySecret = keySecret == null ? "" : keySecret;
        this.keyId = keyId == null ? "" : keyId;
        this.webhookSecret = webhookSecret == null ? "" : webhookSecret;
        if (semesterPriceInr < 1 || annualPriceInr < 1) throw new IllegalArgumentException("Razorpay prices must be positive.");
        this.semesterPricePaise = semesterPriceInr * 100;
        this.annualPricePaise = annualPriceInr * 100;
    }

    public Map<String, Object> createOrder(User user, String plan, String receipt) {
        if (keyId.isBlank() || keySecret.isBlank()) throw new IllegalStateException("Razorpay is not configured on the backend.");
        long amountPaise = priceFor(plan);
        int discount = promotions.getCurrentPromotion().isActive()
            ? Math.max(0, Math.min(100, promotions.getCurrentPromotion().getDiscountPercentage())) : 0;
        amountPaise = Math.max(100, Math.round(amountPaise * (100 - discount) / 100.0));
        return RestClient.create().post().uri("https://api.razorpay.com/v1/orders")
            .headers(h -> h.setBasicAuth(keyId, keySecret))
            .body(Map.of("amount", amountPaise, "currency", "INR", "receipt", receipt, "notes", Map.of("userId", user.getId(), "plan", plan)))
            .retrieve().body(Map.class);
    }

    private long priceFor(String plan) {
        if ("sem".equals(plan)) return semesterPricePaise;
        if ("annual".equals(plan)) return annualPricePaise;
        throw new IllegalArgumentException("Unsupported payment plan.");
    }

    @Transactional
    public Subscription verifyPayment(User user, String orderId, String paymentId, String signature) {
        if (keySecret.isBlank()) throw new IllegalStateException("Razorpay is not configured on the backend.");
        if (orderId == null || paymentId == null || signature == null || !constantTime(signature, hmac(orderId + "|" + paymentId)))
            throw new SecurityException("Razorpay payment signature is invalid.");
        return activate(user, paymentId);
    }

    @Transactional
    public Subscription processWebhook(String payload, String signature, String paymentId) {
        if (webhookSecret.isBlank() || !constantTime(signature, hmac(payload, webhookSecret)))
            throw new SecurityException("Razorpay webhook signature is invalid.");
        User user = null;
        // Webhooks are accepted only after the payment was verified by the client flow;
        // paymentId remains the idempotency key and is handled by the repository.
        return subscriptions.findByProviderPaymentId(paymentId).orElseThrow(
            () -> new IllegalArgumentException("No pending subscription found for this payment."));
    }

    private Subscription activate(User user, String paymentId) {
        return subscriptions.findByProviderPaymentId(paymentId).orElseGet(() -> subscriptions.save(
            Subscription.builder().user(user).plan("END_SEM").status("ACTIVE")
                .provider("RAZORPAY").providerPaymentId(paymentId).startsAt(Instant.now()).build()));
    }

    private String hmac(String value) { return hmac(value, keySecret); }
    private String hmac(String value, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) { throw new IllegalStateException("Could not verify Razorpay signature.", ex); }
    }
    private boolean constantTime(String a, String b) {
        return java.security.MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
