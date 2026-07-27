"use client";

import React, { useState } from "react";
import { X, Sparkles, Mail, Lock, CheckCircle2 } from "lucide-react";
import GoogleLogin from "./GoogleLogin";
import GithubLogin from "./GithubLogin";
import EmailAndPasswordLogin from "./EmailAndPasswordLogin";
import EmailAndPasswordRegister from "./EmailAndPasswordRegister";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = "Save & Export Your CV",
  subtitle = "Sign in or create a free account to save your CV, download high-res PDFs, and access AI features.",
  onSuccess,
}) => {
  const [tab, setTab] = useState<"login" | "register">("register");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pr-4">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-1">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2.5">
          <GoogleLogin />
          <GithubLogin />
        </div>

        <div className="relative flex items-center justify-center my-1">
          <span className="absolute inset-x-0 h-px bg-border"></span>
          <span className="relative px-3 bg-background text-[11px] font-medium text-muted-foreground uppercase">
            or continue with email
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTab("register")}
            className={`py-1.5 rounded-lg transition-all ${
              tab === "register"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Free Account
          </button>
          <button
            onClick={() => setTab("login")}
            className={`py-1.5 rounded-lg transition-all ${
              tab === "login"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Forms */}
        <div className="text-sm">
          {tab === "register" ? (
            <EmailAndPasswordRegister />
          ) : (
            <EmailAndPasswordLogin />
          )}
        </div>

        {/* Benefits bullets */}
        <div className="pt-2 border-t border-border flex items-center justify-around text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free PDF Export
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> ATS Analyzer
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Multi-Language
          </span>
        </div>
      </div>
    </div>
  );
};
