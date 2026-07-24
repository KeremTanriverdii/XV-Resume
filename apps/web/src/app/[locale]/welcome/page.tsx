'use client';

import React from 'react';
import { useRouter } from '@/i18n/routing';
import { CheckCircle2, Sparkles, ArrowRight, FileText, Languages, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WelcomePage() {
  const router = useRouter();
  const t = useTranslations('Dashboard'); // Reuse dashboard/common translations if needed, otherwise fallback to clean copy

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      {/* Scope-contained keyframe animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drift-grid {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-8px) translateX(8px); }
        }
        @keyframes slow-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.08); }
        }
        .animate-drift-grid {
          animation: drift-grid 20s ease-in-out infinite;
        }
        .animate-slow-rotate {
          animation: slow-rotate 40s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 12s ease-in-out infinite;
        }
      `}} />

      {/* 1. Animated SVG Grid Pattern Background */}
      <div className="absolute inset-0 -z-20 opacity-30 animate-drift-grid">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 2. Slowly Rotating Minimal Concentric Circle SVG */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 -z-10 pointer-events-none animate-slow-rotate">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-500">
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="8 4" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 4" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Premium Background Soft Glowing Blobs */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow [animation-delay:-6s]" />

      <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Animated Check Ring */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="h-20 w-20 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </div>

        {/* Success Header */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Welcome to the Executive Circle
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-medium">
            Your XVResume Pro account is now active. You have unlocked unlimited access to the world's most precise ATS tailoring engine.
          </p>
        </div>

        {/* Dynamic Road Map (Broken Symmetry Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {/* Step 1 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Paste Target Job</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find any job listing link (LinkedIn, Kariyer, Indeed) and paste it directly into the AI analyzer.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Match & Optimize</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Let the Google XYZ model rewrite your accomplishments and analyze ATS score dynamically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Languages className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Download in 6 Languages</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly export premium PDFs in German, English, French, Spanish, Italian, or Turkish.
            </p>
          </div>
        </div>

        {/* Interactive Action Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Go to Dashboard & Tailor CV</span>
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Footer Detail */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span>Premium services fully activated</span>
        </div>
      </div>
    </div>
  );
}
