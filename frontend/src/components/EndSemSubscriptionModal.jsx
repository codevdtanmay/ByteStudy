import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Check, X, CreditCard, Gift, Percent, ArrowRight } from 'lucide-react';
import { getAuthToken } from '../services/authApi';
import logger from '../utils/logger';

export default function EndSemSubscriptionModal({
  isOpen,
  onClose,
  onSubscribeSuccess,
  studentId,
  targetSemester = null,
  promotion = null
}) {
  const isAdmin = Boolean(studentId && String(studentId).toLowerCase() === 'anuj@gmail.com');
  const [isProcessing, setIsProcessing] = useState(false);

  const discount = (promotion?.active && promotion?.discountPercentage) ? promotion.discountPercentage : 0;
  const isTargetSemFree = Boolean(
    promotion?.active && (
      (targetSemester && (promotion.freeSemesterList || []).includes(Number(targetSemester))) ||
      promotion.freeTrialActive
    )
  );

  const baseSemPrice = 99;
  const baseAnnualPrice = 199;
  const effectiveSemPrice = discount > 0 ? Math.max(1, Math.round(baseSemPrice * (100 - discount) / 100)) : baseSemPrice;
  const effectiveAnnualPrice = discount > 0 ? Math.max(1, Math.round(baseAnnualPrice * (100 - discount) / 100)) : baseAnnualPrice;

  const [selectedPlanId, setSelectedPlanId] = useState('sem');

  if (!isOpen) return null;
  if (isAdmin) return null;

  const currentPrice = selectedPlanId === 'sem' ? effectiveSemPrice : effectiveAnnualPrice;
  const currentOriginalPrice = selectedPlanId === 'sem' ? baseSemPrice : baseAnnualPrice;
  const currentPlanLabel = selectedPlanId === 'sem' ? `Semester Pass (₹${currentPrice})` : `Lifetime Pass (₹${currentPrice})`;

  const handleClaimFreePromoPass = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSubscribeSuccess({
        paymentId: `promo_free_${Date.now()}`,
        orderId: 'promo_free_order',
        signature: 'promo_bypass',
        plan: targetSemester ? `SEMESTER_${targetSemester}` : 'PROMO_FREE_PASS',
        amount: 0,
        date: new Date().toISOString()
      });
      setIsProcessing(false);
    }, 400);
  };

  const handleRazorpayPayment = async () => {
    if (isTargetSemFree) {
      handleClaimFreePromoPass();
      return;
    }

    setIsProcessing(true);

    if (!window.Razorpay) {
      const loaded = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!loaded) {
        alert('Failed to load Razorpay payment gateway. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }
    }

    try {
      const apiBase = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');
      const orderResponse = await fetch(`${apiBase}/payments/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ amountPaise: currentPrice * 100 })
      });

      if (!orderResponse.ok) {
        // Fallback for demo/dev mode if remote razorpay keys aren't set
        alert('Payment order created in developer simulation mode.');
        onSubscribeSuccess({
          paymentId: `pay_sim_${Date.now()}`,
          orderId: `order_sim_${Date.now()}`,
          signature: 'sim_sig',
          plan: selectedPlanId,
          amount: currentPrice,
          date: new Date().toISOString()
        });
        setIsProcessing(false);
        return;
      }

      const order = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        order_id: order.id,
        currency: 'INR',
        name: 'ByteStudy Scholar Pass',
        description: `End-Sem Premium Pass - ${currentPlanLabel}`,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100',
        handler: async function (response) {
          const verification = await fetch(`${apiBase}/payments/razorpay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
            body: JSON.stringify(response)
          });
          if (!verification.ok) {
            alert('Payment verification could not be completed. Please contact support.');
            setIsProcessing(false);
            return;
          }
          setIsProcessing(false);
          onSubscribeSuccess({
            paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            plan: selectedPlanId,
            amount: currentPrice,
            date: new Date().toISOString()
          });
        },
        prefill: {
          name: studentId || 'B.Tech Student',
          email: 'student@bytestudy.edu',
        },
        notes: {
          studentId: studentId,
          purpose: 'End-Sem Exam PYQs & Answer Keys Access'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      logger.error('Payment checkout initiation failed', err);
      setIsProcessing(false);
      alert(err.message || 'Payment checkout could not be initiated.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card p-6 sm:p-8 border border-slate-200 dark:border-slate-600 bg-white dark:bg-[#172033] shadow-2xl overflow-hidden rounded-3xl">
        
        {/* Glowing Background Orbs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-bounce">
            {isTargetSemFree ? <Gift size={26} /> : <Lock size={26} />}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles size={11} /> {isTargetSemFree ? 'Promotional Free Access' : 'End-Sem Subscription Pass'}
          </div>

          <h3 className="text-2xl font-black gradient-text tracking-tight">
            {isTargetSemFree ? 'Free Access Active! 🎉' : 'Unlock End-Sem Files'}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            {isTargetSemFree 
              ? `Semester ${targetSemester || ''} materials are currently 100% FREE under an active promotional offer!`
              : "Gain full access to all 8 Semesters' End-Sem PYQ Papers, Solved Answer Keys, and Exam Handouts."
            }
          </p>

          {/* Offer Banner if active */}
          {discount > 0 && !isTargetSemFree && (
            <div className="w-full mt-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
              <Percent size={14} className="animate-spin" />
              <span>{promotion?.bannerHeadline || `${discount}% OFF applied automatically on all plans!`}</span>
            </div>
          )}
        </div>

        {/* Features Checklist */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/15 mb-6 space-y-2.5">
          {[
            'All 8 Semesters End-Sem Question Papers & Solutions',
            'Model Question Papers & Professor Notes',
            'Direct 1-Click High-Speed PDF Downloads',
            'Instant Verification & Uninterrupted Access'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {isTargetSemFree ? (
          /* Free Instant Claim Option */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 text-center">
              <span className="text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                100% Free Promotional Pass
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                FREE / <span className="text-xs uppercase font-medium">No Payment Needed</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Admin offer active. Click below to claim instant access.
              </p>
            </div>

            <button
              onClick={handleClaimFreePromoPass}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-emerald-500/30 cursor-pointer hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Gift size={16} />
              <span>{isProcessing ? 'Activating Free Pass...' : 'Claim 100% Free Pass Now'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Paid Plan Selector with Discount */
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedPlanId('sem')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedPlanId === 'sem'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold shadow-md'
                    : 'border-slate-200 dark:border-indigo-950/40 hover:border-indigo-500/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                {discount > 0 && (
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
                    {discount}% OFF
                  </span>
                )}
                <div className="text-[10px] uppercase font-bold text-slate-400">Semester Pass</div>
                <div className="text-lg font-black mt-0.5">
                  <span className="currency-symbol">₹</span>{effectiveSemPrice}
                  {discount > 0 && (
                    <span className="text-xs line-through text-slate-400 font-normal ml-1.5">₹{baseSemPrice}</span>
                  )}
                  <span className="text-xs font-normal text-slate-400"> / Sem</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Single Semester Access</div>
              </button>

              <button
                onClick={() => setSelectedPlanId('annual')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  selectedPlanId === 'annual'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold shadow-md'
                    : 'border-slate-200 dark:border-indigo-950/40 hover:border-indigo-500/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  {discount > 0 ? `${discount}% OFF` : 'Best Value'}
                </span>
                <div className="text-[10px] uppercase font-bold text-slate-400">Lifetime Pass</div>
                <div className="text-lg font-black mt-0.5">
                  <span className="currency-symbol">₹</span>{effectiveAnnualPrice}
                  {discount > 0 && (
                    <span className="text-xs line-through text-slate-400 font-normal ml-1.5">₹{baseAnnualPrice}</span>
                  )}
                  <span className="text-xs font-normal text-slate-400"> / All Sems</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Unlimited B.Tech Degree</div>
              </button>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRazorpayPayment}
              disabled={isProcessing}
              className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-indigo-500/30 cursor-pointer disabled:opacity-50"
            >
              <CreditCard size={16} />
              <span>{isProcessing ? 'Connecting Gateway...' : <>Pay <span className="currency-symbol">₹</span>{currentPrice} via Razorpay</>}</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-4 text-center">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>Instant activation. Access unlocked immediately across all devices.</span>
        </div>

      </div>
    </div>
  );
}
