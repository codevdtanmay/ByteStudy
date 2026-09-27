import React, { useState } from 'react';
import { Flame, Gift, ArrowRight, X, Percent, Clock, Sparkles } from 'lucide-react';

export default function PromotionBanner({ promotion, onExploreOffer }) {
  const [dismissed, setDismissed] = useState(false);

  if (!promotion || !promotion.active || dismissed) {
    return null;
  }

  const freeSems = promotion.freeSemesterList || [];
  const hasDiscount = promotion.discountPercentage > 0;
  const isFreeTrial = promotion.freeTrialActive;

  return (
    <aside
      aria-label="Promotional Announcement"
      className="promotion-banner relative z-30 w-full overflow-hidden border-b transition-all duration-300
        bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 text-white border-amber-500/30 shadow-md
        dark:bg-black dark:bg-none dark:text-white dark:border-neutral-800"
    >
      {/* Background Accent Shimmer (Only in Light mode) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none dark:hidden" />

      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs relative">
        
        {/* Left Side: Badge & Message */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
            bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm shrink-0
            dark:bg-white/10 dark:text-white dark:border-white/20">
            <Flame size={12} className="text-amber-200 dark:text-white animate-pulse" />
            {promotion.badgeText || 'SPECIAL OFFER'}
          </span>

          <p className="font-bold text-white tracking-tight truncate drop-shadow-sm dark:drop-shadow-none">
            {promotion.bannerHeadline}
          </p>

          {/* Highlights tags */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/25 text-[10px] font-extrabold text-amber-200 border border-white/15 backdrop-blur-sm dark:bg-neutral-900 dark:text-white dark:border-neutral-700">
                <Percent size={10} /> {promotion.discountPercentage}% OFF
              </span>
            )}

            {freeSems.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/30 text-[10px] font-extrabold text-emerald-100 border border-emerald-300/40 backdrop-blur-sm dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700">
                <Gift size={10} /> Sem {freeSems.join(', ')} 100% FREE
              </span>
            )}

            {isFreeTrial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/30 text-[10px] font-extrabold text-rose-100 border border-rose-300/40 backdrop-blur-sm dark:bg-neutral-900 dark:text-neutral-200 dark:border-neutral-700">
                <Clock size={10} /> {promotion.freeTrialDays} Days Trial Active
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {onExploreOffer && (
            <button
              onClick={onExploreOffer}
              className="px-3.5 py-1 rounded-xl bg-white text-stone-900 hover:bg-neutral-100 font-black text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <Sparkles size={11} className="text-amber-500 dark:text-black" />
              <span>Claim Offer</span>
              <ArrowRight size={12} />
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800"
          >
            <X size={14} />
          </button>
        </div>

      </div>
    </aside>
  );
}
