package com.bytepath.service;

import com.bytepath.dto.request.GrantSubscriptionRequest;
import com.bytepath.dto.request.UpdatePromotionRequest;
import com.bytepath.dto.response.PromotionResponse;
import com.bytepath.dto.response.SubscriptionAdminResponse;
import com.bytepath.model.Subscription;
import com.bytepath.model.SystemPromotion;
import com.bytepath.model.User;
import com.bytepath.repository.SubscriptionRepository;
import com.bytepath.repository.SystemPromotionRepository;
import com.bytepath.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final SystemPromotionRepository promoRepo;
    private final UserRepository userRepo;
    private final SubscriptionRepository subscriptionRepo;

    public PromotionService(SystemPromotionRepository promoRepo,
                            UserRepository userRepo,
                            SubscriptionRepository subscriptionRepo) {
        this.promoRepo = promoRepo;
        this.userRepo = userRepo;
        this.subscriptionRepo = subscriptionRepo;
    }

    @Transactional
    public SystemPromotion getOrCreateEntity() {
        return promoRepo.findFirstByOrderByIdAsc().orElseGet(() -> {
            SystemPromotion defaultPromo = SystemPromotion.builder()
                .active(true)
                .bannerHeadline("Special Offer for You All! Up to 50% OFF on all End-Sem Passes")
                .discountPercentage(50)
                .freeSemesters("")
                .freeTrialActive(false)
                .freeTrialDays(5)
                .badgeText("LIMITED TIME OFFER")
                .updatedAt(Instant.now())
                .build();
            return promoRepo.save(defaultPromo);
        });
    }

    public PromotionResponse getCurrentPromotion() {
        SystemPromotion promo = getOrCreateEntity();
        List<Integer> freeList = new ArrayList<>(promo.parseFreeSemesters());
        Collections.sort(freeList);

        return PromotionResponse.builder()
            .active(promo.isActive())
            .bannerHeadline(promo.getBannerHeadline())
            .discountPercentage(promo.getDiscountPercentage())
            .freeSemesters(promo.getFreeSemesters())
            .freeSemesterList(freeList)
            .freeTrialActive(promo.isFreeTrialActive())
            .freeTrialDays(promo.getFreeTrialDays())
            .freeTrialExpiresAt(promo.getFreeTrialExpiresAt())
            .badgeText(promo.getBadgeText())
            .updatedAt(promo.getUpdatedAt())
            .build();
    }

    public boolean isSemesterFree(int semesterNumber) {
        try {
            SystemPromotion promo = getOrCreateEntity();
            return promo.isSemesterFree(semesterNumber);
        } catch (Exception ex) {
            return false;
        }
    }

    @Transactional
    public PromotionResponse updatePromotion(UpdatePromotionRequest request) {
        SystemPromotion promo = getOrCreateEntity();

        promo.setActive(request.isActive());
        if (request.getBannerHeadline() != null) {
            promo.setBannerHeadline(request.getBannerHeadline().trim());
        }
        if (request.getDiscountPercentage() != null) {
            promo.setDiscountPercentage(Math.max(0, Math.min(100, request.getDiscountPercentage())));
        }
        if (request.getFreeSemesters() != null) {
            promo.setFreeSemesters(request.getFreeSemesters().trim());
        }
        if (request.getBadgeText() != null) {
            promo.setBadgeText(request.getBadgeText().trim());
        }

        boolean prevTrial = promo.isFreeTrialActive();
        promo.setFreeTrialActive(request.isFreeTrialActive());
        if (request.getFreeTrialDays() != null && request.getFreeTrialDays() > 0) {
            promo.setFreeTrialDays(request.getFreeTrialDays());
        }

        if (request.isFreeTrialActive()) {
            if (!prevTrial || promo.getFreeTrialExpiresAt() == null || promo.getFreeTrialExpiresAt().isBefore(Instant.now())) {
                promo.setFreeTrialExpiresAt(Instant.now().plus(promo.getFreeTrialDays(), ChronoUnit.DAYS));
            }
        } else {
            promo.setFreeTrialExpiresAt(null);
        }

        promo.setUpdatedAt(Instant.now());
        promoRepo.save(promo);
        return getCurrentPromotion();
    }

    @Transactional
    public SubscriptionAdminResponse grantSubscription(GrantSubscriptionRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        if (email.isBlank()) {
            throw new IllegalArgumentException("Student email cannot be empty.");
        }

        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("No student account found with email: " + email));

        user.setHasEndSemSubscription(true);
        userRepo.save(user);

        Instant startsAt = Instant.now();
        Instant expiresAt = null;
        if (request.getDurationDays() != null && request.getDurationDays() > 0) {
            expiresAt = startsAt.plus(request.getDurationDays(), ChronoUnit.DAYS);
        }

        String planName = request.getPlan() != null && !request.getPlan().isBlank() 
            ? request.getPlan().trim() 
            : (request.getSemester() != null ? "SEMESTER_" + request.getSemester() : "END_SEM_LIFETIME");

        Subscription subscription = Subscription.builder()
            .user(user)
            .plan(planName)
            .status("ACTIVE")
            .provider("MANUAL_ADMIN_GRANT")
            .providerPaymentId("admin_grant_" + System.currentTimeMillis() + (request.getNote() != null ? "_" + request.getNote().replaceAll("\\s+", "_") : ""))
            .startsAt(startsAt)
            .expiresAt(expiresAt)
            .createdAt(Instant.now())
            .build();

        Subscription saved = subscriptionRepo.save(subscription);

        return SubscriptionAdminResponse.builder()
            .id(saved.getId())
            .studentName(user.getName())
            .studentEmail(user.getEmail())
            .studentLoginId(user.getLoginId())
            .plan(saved.getPlan())
            .status(saved.getStatus())
            .provider(saved.getProvider())
            .providerPaymentId(saved.getProviderPaymentId())
            .startsAt(saved.getStartsAt())
            .expiresAt(saved.getExpiresAt())
            .createdAt(saved.getCreatedAt())
            .active(saved.isActive(Instant.now()))
            .build();
    }

    @Transactional
    public void revokeSubscription(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        User user = userRepo.findByEmail(normalizedEmail)
            .orElseThrow(() -> new NoSuchElementException("No student account found with email: " + normalizedEmail));

        user.setHasEndSemSubscription(false);
        userRepo.save(user);

        List<Subscription> subs = subscriptionRepo.findByUserOrderByCreatedAtDesc(user);
        for (Subscription sub : subs) {
            if ("ACTIVE".equalsIgnoreCase(sub.getStatus())) {
                sub.setStatus("REVOKED");
                sub.setExpiresAt(Instant.now());
                subscriptionRepo.save(sub);
            }
        }
    }

    public List<SubscriptionAdminResponse> getAllSubscriptions() {
        return subscriptionRepo.findAll().stream()
            .sorted(Comparator.comparing(Subscription::getCreatedAt).reversed())
            .limit(100)
            .map(sub -> SubscriptionAdminResponse.builder()
                .id(sub.getId())
                .studentName(sub.getUser() != null ? sub.getUser().getName() : "Unknown")
                .studentEmail(sub.getUser() != null ? sub.getUser().getEmail() : "")
                .studentLoginId(sub.getUser() != null ? sub.getUser().getLoginId() : "")
                .plan(sub.getPlan())
                .status(sub.getStatus())
                .provider(sub.getProvider())
                .providerPaymentId(sub.getProviderPaymentId())
                .startsAt(sub.getStartsAt())
                .expiresAt(sub.getExpiresAt())
                .createdAt(sub.getCreatedAt())
                .active(sub.isActive(Instant.now()))
                .build())
            .collect(Collectors.toList());
    }
}
