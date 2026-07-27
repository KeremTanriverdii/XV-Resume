"use client";

import React from "react";
import { User, Briefcase, GraduationCap, Wrench, Globe, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export interface StepItem {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isComplete: boolean;
}

interface StepFormSidebarProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  steps: StepItem[];
}

export const StepFormSidebar: React.FC<StepFormSidebarProps> = ({
  currentStep,
  onSelectStep,
  steps,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 bg-muted/40 dark:bg-zinc-900/40 rounded-2xl border border-border/70">
      <div className="px-2 py-1 mb-1">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Resume Steps
        </h3>
        <p className="text-xs text-muted-foreground">Fill in your details step by step</p>
      </div>

      <div className="flex flex-col gap-1.5">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`group flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer border ${
                isActive
                  ? "bg-background text-foreground border-primary/40 shadow-sm ring-1 ring-primary/20 font-semibold"
                  : "bg-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : step.isComplete
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  }`}
                >
                  {step.isComplete && !isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <div className="truncate">
                  <p className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : ""}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{step.subtitle}</p>
                </div>
              </div>

              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "text-primary translate-x-0.5" : "opacity-30 group-hover:opacity-70"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
