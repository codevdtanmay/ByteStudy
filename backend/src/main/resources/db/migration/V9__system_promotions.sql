CREATE TABLE IF NOT EXISTS system_promotions (
    id BIGSERIAL PRIMARY KEY,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    banner_headline VARCHAR(255) DEFAULT 'Special Offer for You All! Up to 50% OFF on all End-Sem Passes',
    discount_percentage INTEGER NOT NULL DEFAULT 50,
    free_semesters VARCHAR(255) DEFAULT '',
    free_trial_active BOOLEAN NOT NULL DEFAULT FALSE,
    free_trial_days INTEGER NOT NULL DEFAULT 5,
    free_trial_expires_at TIMESTAMPTZ,
    badge_text VARCHAR(100) DEFAULT 'SPECIAL OFFER',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_promotions (id, is_active, banner_headline, discount_percentage, free_semesters, free_trial_active, free_trial_days, badge_text, updated_at)
VALUES (1, TRUE, 'Special Offer for You All! Up to 50% OFF on all End-Sem Passes', 50, '', FALSE, 5, 'LIMITED TIME OFFER', NOW())
ON CONFLICT (id) DO NOTHING;
