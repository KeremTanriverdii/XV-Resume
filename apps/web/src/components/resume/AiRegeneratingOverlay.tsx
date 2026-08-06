'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, CheckCircle2, ShieldCheck, Lightbulb, Circle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ColorThemeId } from './ResumeTemplates';

interface AiRegeneratingOverlayProps {
  isOpen: boolean;
  title?: string;
  onClose?: () => void;
  colorTheme?: ColorThemeId;
}

const STEP_ICONS = ['🔍', '🎯', '⚡', '📊', '✍️', '✨'];
const TOTAL_STEPS = 6;
const TOTAL_TIPS = 3;

// Theme configuration for overlay colors (Full Light & Dark Theme Adaptation)
const THEME_ACCENTS: Record<
  ColorThemeId,
  {
    border: string;
    glow: string;
    gradient: string;
    badge: string;
    text: string;
    shimmer: string;
  }
> = {
  blue: {
    border: 'border-blue-500/40 dark:border-blue-500/30',
    glow: 'bg-blue-500/15 dark:bg-blue-600/20',
    gradient: 'from-blue-600 to-cyan-500',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    shimmer: 'from-blue-600 via-cyan-500 to-indigo-600',
  },
  emerald: {
    border: 'border-emerald-500/40 dark:border-emerald-500/30',
    glow: 'bg-emerald-500/15 dark:bg-emerald-600/20',
    gradient: 'from-emerald-600 to-teal-500',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
    shimmer: 'from-emerald-600 via-teal-500 to-cyan-600',
  },
  indigo: {
    border: 'border-indigo-500/40 dark:border-indigo-500/30',
    glow: 'bg-indigo-500/15 dark:bg-indigo-600/20',
    gradient: 'from-indigo-600 to-purple-500',
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
    shimmer: 'from-indigo-600 via-purple-500 to-pink-600',
  },
  purple: {
    border: 'border-purple-500/40 dark:border-purple-500/30',
    glow: 'bg-purple-500/15 dark:bg-purple-600/20',
    gradient: 'from-purple-600 to-pink-500',
    badge: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
    shimmer: 'from-purple-600 via-pink-500 to-indigo-600',
  },
  slate: {
    border: 'border-slate-500/40 dark:border-slate-500/30',
    glow: 'bg-slate-500/15 dark:bg-slate-600/20',
    gradient: 'from-slate-700 to-zinc-600 dark:from-slate-600 dark:to-zinc-500',
    badge: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    text: 'text-slate-700 dark:text-slate-300',
    shimmer: 'from-slate-600 via-zinc-400 to-slate-500',
  },
};

export const AiRegeneratingOverlay: React.FC<AiRegeneratingOverlayProps> = ({
  isOpen,
  title,
  onClose,
  colorTheme = 'blue',
}) => {
  const t = useTranslations('aiOverlay');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  const themeStyle = THEME_ACCENTS[colorTheme] || THEME_ACCENTS.blue;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTipIndex(0);
      setFadeState('in');
      return;
    }

    const interval = setInterval(() => {
      setFadeState('out');
      setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % TOTAL_STEPS);
        setTipIndex((prev) => (prev + 1) % TOTAL_TIPS);
        setFadeState('in');
      }, 300);
    }, 2900);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepKey = (currentStepIndex + 1).toString();
  const currentTipKey = (tipIndex + 1).toString();
  const stepIcon = STEP_ICONS[currentStepIndex];

  const stepText = t(`steps.${currentStepKey}.text`);
  const tipText = t(`tips.${currentTipKey}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-300">
      {/* 16:9 Widescreen Spacious Container Card (Light & Dark Compatible) */}
      <div
        className={`relative w-full max-w-4xl aspect-[16/9] min-h-[360px] sm:min-h-[440px] overflow-hidden rounded-3xl border ${themeStyle.border} bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-slate-100 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-2xl flex flex-col justify-between`}
      >
        {/* Close button if test mode */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 z-30 rounded-full p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Kapat"
          >
            ✕
          </button>
        )}

        {/* Ambient Glowing Background Auras matching theme */}
        <div
          className={`absolute -top-32 -left-32 h-64 w-64 rounded-full ${themeStyle.glow} blur-3xl animate-pulse`}
        />
        <div
          className={`absolute -bottom-32 -right-32 h-64 w-64 rounded-full ${themeStyle.glow} blur-3xl animate-pulse`}
        />

        {/* TOP ROW: Header Badge & Step Counter */}
        <div className="flex items-center justify-between z-10">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold shadow-xs ${themeStyle.badge}`}
          >
            <Sparkles className="h-4 w-4 animate-spin text-amber-500 dark:text-amber-400" />
            <span>{title || t('title')}</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide flex items-center gap-2">
            <span>
              {t('stepCounter', {
                current: currentStepIndex + 1,
                total: TOTAL_STEPS,
              })}
            </span>
          </div>
        </div>

        {/* PIPELINE STEPPER DOTS (Light & Dark Compatible) */}
        <div className="w-full hidden sm:flex items-center justify-between gap-2 z-10 my-2 px-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const label = t(`steps.${idx + 1}.label`);

            return (
              <div
                key={idx}
                className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : isCurrent
                      ? `${themeStyle.badge} font-bold scale-105 shadow-sm`
                      : 'border-slate-200/80 dark:border-white/5 bg-slate-100/60 dark:bg-white/5 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0 opacity-40" />
                )}
                <span className="truncate">{label}</span>
              </div>
            );
          })}
        </div>

        {/* MIDDLE ROW: 16:9 Content Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 my-auto z-10 px-2 sm:px-4">
          {/* Left: Glowing Pulsing AI Orb */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className="absolute h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-slate-300/40 dark:border-white/20 animate-ping opacity-60" />
            <div className="absolute h-28 w-28 sm:h-32 sm:w-32 rounded-full border border-slate-300/30 dark:border-white/10 animate-pulse" />

            <div
              className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr ${themeStyle.gradient} p-0.5 shadow-2xl`}
            >
              <div className="h-full w-full rounded-[22px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <Wand2
                  className={`h-9 w-9 sm:h-11 sm:w-11 ${themeStyle.text} animate-bounce`}
                />
              </div>
            </div>
          </div>

          {/* Right: Dynamic Animated Status Text */}
          <div className="flex-1 min-h-[85px] flex flex-col justify-center text-center sm:text-left">
            <div
              className={`transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 ${
                fadeState === 'in'
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-2 scale-95'
              }`}
            >
              <span className="text-3xl sm:text-4xl shrink-0">{stepIcon}</span>
              <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed sm:leading-snug tracking-tight">
                {stepText}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Infinite Indeterminate Shimmer Bar & Rotating AI Tips */}
        <div className="w-full space-y-3 z-10">
          {/* Smooth Continuous Shimmer Wave Bar */}
          <div className="relative h-2.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/80 overflow-hidden p-0.5 border border-slate-300/50 dark:border-white/10 shadow-inner">
            <div
              className={`h-full w-full rounded-full bg-gradient-to-r ${themeStyle.shimmer} animate-pulse shadow-md`}
            />
          </div>

          {/* Rotating AI Best Practices Tip & Integrity Badge */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300/90 text-[11px] sm:text-xs">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0 animate-pulse" />
              <span className="truncate max-w-lg">{tipText}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t('securityBadge')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
