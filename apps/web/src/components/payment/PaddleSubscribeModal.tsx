'use client';

import React, { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

interface PaddleSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
}

export const PaddleSubscribeModal: React.FC<PaddleSubscribeModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
}) => {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<boolean>(false);

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
  const environment = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox') as any;
  const monthlyPriceId = process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID || '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID || '';

  useEffect(() => {
    console.log("Paddle Debug Info:", {
      clientToken: clientToken ? `${clientToken.substring(0, 10)}...` : 'empty',
      environment,
      monthlyPriceId,
      yearlyPriceId,
      userId,
      userEmail
    });
  }, [clientToken, environment, monthlyPriceId, yearlyPriceId, userId, userEmail]);

  useEffect(() => {
    if (!clientToken) return;

    initializePaddle({
      token: clientToken,
      environment: environment,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          onClose();
          window.location.href = '/welcome';
        }
      },
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    }).catch((err) => {
      console.error('Failed to initialize Paddle:', err);
    });
  }, [clientToken, environment, onClose]);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    const selectedPriceId = billingCycle === 'monthly' ? monthlyPriceId : yearlyPriceId;

    if (!selectedPriceId) {
      alert('Paddle Price ID is missing in environment variables. Please check your .env.local!');
      return;
    }

    if (!paddle) {
      alert('Paddle is initializing. Please try again in a moment.');
      return;
    }

    setLoading(true);

    try {
      paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          variant: 'one-page',
          successUrl: `${window.location.origin}/welcome`,
        },
        items: [{ priceId: selectedPriceId, quantity: 1 }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: userId ? { userId } : undefined,
      });
    } catch (err) {
      console.error('Paddle Checkout Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
            ✨ Premium Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Upgrade to ResumeX Pro
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Create unlimited ATS-tailored resumes in 6+ languages with executive-level AI precision.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-white/5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing ($15/mo)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing
              <span className="ml-1.5 rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Details Card */}
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/30 to-slate-900 p-5 mb-6">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-white">Pro Plan</span>
            <div className="text-right">
              <span className="text-3xl font-black text-white">
                {billingCycle === 'monthly' ? '$15' : '$12'}
              </span>
              <span className="text-xs text-slate-400">/ month</span>
            </div>
          </div>

          <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Unlimited ATS-Tailored Resume Generations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Multi-language Translations (TR, EN, DE, FR, ES, IT)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> PDF Export with Anti-Break Page Spacing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span> Instant AI Scraper & Match Analysis
            </li>
          </ul>
        </div>

        {/* Subscribe Action Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? 'Opening Checkout...' : `Subscribe Now — ${billingCycle === 'monthly' ? '$15/mo' : '$144/year'}`}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-500">
          🔒 Secure 256-bit encrypted checkout via Paddle Merchant of Record. Cancel anytime.
        </p>
      </div>
    </div>
  );
};
