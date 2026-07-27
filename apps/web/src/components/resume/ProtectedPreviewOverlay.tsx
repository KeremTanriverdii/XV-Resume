"use client";

import React from "react";
import { Lock, Download, Mail, Save, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedPreviewOverlayProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onActionTrigger: (action: "download" | "email" | "save") => void;
}

export const ProtectedPreviewOverlay: React.FC<ProtectedPreviewOverlayProps> = ({
  children,
  isAuthenticated,
  onActionTrigger,
}) => {
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-zinc-900/5 dark:bg-zinc-900/40 p-1 sm:p-2">
      {/* Floating Header Action Bar for Guest User */}
      <div className="sticky top-2 z-30 mb-3 mx-auto max-w-md rounded-full border border-primary/30 bg-background/95 backdrop-blur-md p-2 shadow-2xl flex items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <ShieldCheck className="h-4 w-4 text-primary animate-pulse" />
          <span>Guest Preview Mode</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onActionTrigger("email")}
            className="h-8 text-xs gap-1 hover:bg-primary/10"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Email</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onActionTrigger("download")}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-bold shadow-md hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Long Scroll Container with Diagonal Watermarks */}
      <div className="relative overflow-y-auto max-h-[720px] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner select-none pointer-events-none sm:pointer-events-auto">
        {/* Watermark Overlay Grid */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-around overflow-hidden opacity-15 dark:opacity-20 select-none">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="text-center font-extrabold tracking-widest text-zinc-900 dark:text-white text-lg sm:text-2xl transform -rotate-12 whitespace-nowrap uppercase py-4"
            >
              ResumeX Preview • Register to Export High-Res PDF • ResumeX Preview
            </div>
          ))}
        </div>

        {/* Rendered CV Preview */}
        <div className="transform scale-[0.98] sm:scale-100 origin-top">
          {children}
        </div>
      </div>

      {/* Bottom Floating Banner */}
      <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Save your progress permanently and export high-resolution ATS-optimized PDFs.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onActionTrigger("save")}
          className="h-8 text-xs font-semibold gap-1.5 shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save & Register Free</span>
        </Button>
      </div>
    </div>
  );
};
