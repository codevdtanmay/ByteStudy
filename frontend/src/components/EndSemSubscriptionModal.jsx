import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, Check, X, CreditCard, Award, ArrowRight } from 'lucide-react';
import { getAuthToken } from '../services/authApi';

export default function EndSemSubscriptionModal({
  isOpen,
  onClose,
  onSubscribeSuccess,
  studentId
}) {
  const isAdmin = Boolean(studentId && String(studentId).toLowerCase() === 'anuj@gmail.com');
  const [selectedPlan, setSelectedPlan] = useState({ id: 'sem', price: 99, label: 'Semester Pass (₹99)' });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  if (isAdmin) {
    return null;
  }

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);

    // 1. Ensure Razorpay checkout script is loaded
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

    const apiBase = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api').replace(/\/$/, '');
    const orderResponse = await fetch(`${apiBase}/payments/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` },
      body: JSON.stringify({ amountPaise: selectedPlan.price * 100 })
    });
    if (!orderResponse.ok) { alert('The payment service is not configured yet.'); setIsProcessing(false); return; }
    const order = await orderResponse.json();

    // 2. Open Razorpay checkout with a server-created order.
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.id,
      currency: 'INR',
      name: 'ByteStudy Scholar Pass',
      description: `End-Sem Premium Pass - ${selectedPlan.label}`,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=100',
      handler: async function (response) {
        const verification = await fetch(`${apiBase}/payments/razorpay/verify`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAuthToken()}` }, body: JSON.stringify(response)
        });
        if (!verification.ok) { alert('Payment could not be verified. Please contact support.'); setIsProcessing(false); return; }
        setIsProcessing(false);
        // On successful payment verification
        onSubscribeSuccess({
          paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          plan: selectedPlan.id,
          amount: selectedPlan.price,
          date: new Date().toISOString()
        });
      },
      prefill: {
        name: studentId || 'B.Tech Student',
        email: 'anjalimaurya028@gmail.com',
        contact: '9876543210'
      },
      notes: {
        studentId: studentId,
        purpose: 'End-Sem Exam PYQs & Answer Keys Access'
      },
      theme: {
        color: '#6366f1' // Indigo brand theme
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay Error:', err);
      setIsProcessing(false);
      alert('Razorpay checkout could not be opened. No access was granted.');
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
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-bounce">
            <Lock size={26} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles size={11} /> End-Sem Subscription Pass
          </div>
          <h3 className="text-2xl font-black gradient-text tracking-tight">
            Unlock End-Sem Files
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Gain full access to all 8 Semesters' End-Sem PYQ Papers, Solved Answer Keys, and Exam Handouts.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/15 mb-6 space-y-2.5">
          {[
            'All 8 Semesters End-Sem Question Papers & Solutions',
            'Model Question Papers & Professor Notes',
            'Direct 1-Click High-Speed PDF Downloads',
            'Secure Payment via Razorpay (UPI, GPay, Cards, NetBanking)'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan({ id: 'sem', price: 99, label: 'Semester Pass (₹99)' })}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedPlan.id === 'sem'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold shadow-md'
                : 'border-slate-200 dark:border-indigo-950/40 hover:border-indigo-500/40 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400">Standard</div>
            <div className="text-lg font-black mt-0.5"><span className="currency-symbol">₹</span>99 <span className="text-xs font-normal text-slate-400">/ Sem</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Single Semester Access</div>
          </button>

          <button
            onClick={() => setSelectedPlan({ id: 'annual', price: 199, label: 'Lifetime Pass (₹199)' })}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
              selectedPlan.id === 'annual'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold shadow-md'
                : 'border-slate-200 dark:border-indigo-950/40 hover:border-indigo-500/40 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              Best Value
            </span>
            <div className="text-[10px] uppercase font-bold text-slate-400">Lifetime Pass</div>
            <div className="text-lg font-black mt-0.5"><span className="currency-symbol">₹</span>199 <span className="text-xs font-normal text-slate-400">/ All Sems</span></div>
            <div className="text-[10px] text-slate-400 mt-1">Unlimited B.Tech Degree</div>
          </button>
        </div>

        {/* Razorpay Action Button */}
        <button
          onClick={handleRazorpayPayment}
          disabled={isProcessing}
          className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl shadow-indigo-500/30 cursor-pointer disabled:opacity-50"
        >
          <CreditCard size={16} />
          <span>{isProcessing ? 'Connecting Razorpay...' : <>Pay <span className="currency-symbol">₹</span>{selectedPlan.price} via Razorpay</>}</span>
          <ArrowRight size={16} />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-4 text-center">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>256-bit Secure Razorpay Checkout. Instant activation.</span>
        </div>

      </div>
    </div>
  );
}
