"use client";

import React from "react";
import { User, Briefcase, GraduationCap, FolderGit2, Wrench, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

import { useTranslations } from 'next-intl';

export interface ProfileStepInfo {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isComplete: boolean;
  liveDataSummary?: string;
}

interface ProfileStepSidebarProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  steps: ProfileStepInfo[];
  profileName?: string;
}

export const ProfileStepSidebar: React.FC<ProfileStepSidebarProps> = ({
  currentStep,
  onSelectStep,
  steps,
  profileName,
}) => {
  const t = useTranslations('profiles');
  return (
    <aside className="flex flex-col gap-3 p-4 bg-card rounded-2xl border border-border/80 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 px-1">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
            {profileName || t('profileSetupSteps')}
          </h3>
          <p className="text-[11px] text-muted-foreground">{t('completeStepsDesc')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`group flex flex-col p-3 rounded-xl transition-all text-left cursor-pointer border ${
                isActive
                  ? "bg-primary/10 border-primary/40 text-foreground shadow-xs ring-1 ring-primary/20"
                  : "bg-background/60 hover:bg-background border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold"
                        : step.isComplete
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.isComplete && !isActive ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{step.subtitle}</p>
                  </div>
                </div>

                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                    isActive ? "text-primary translate-x-0.5" : "opacity-30 group-hover:opacity-70"
                  }`}
                />
              </div>

              {/* Live Data Summary Snippet */}
              {step.liveDataSummary && (
                <div className="mt-2 pt-1.5 border-t border-border/40 text-[10px] text-zinc-600 dark:text-zinc-400 truncate font-mono">
                  {step.liveDataSummary}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
