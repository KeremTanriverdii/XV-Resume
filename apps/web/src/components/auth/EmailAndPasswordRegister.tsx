'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function EmailAndPasswordRegister() {
  const supabase = createClient();
  const t = useTranslations('register');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  function validate(fullName: string, email: string, password: string, confirmPassword: string): FieldErrors {
    const errs: FieldErrors = {};
    if (!fullName.trim()) errs.fullName = t('errorFullNameRequired');
    if (!email) errs.email = t('errorEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('errorInvalidEmail');
    if (!password) errs.password = t('errorPasswordRequired');
    else if (password.length < 8) errs.password = t('errorPasswordShort');
    if (password && confirmPassword !== password) errs.confirmPassword = t('errorPasswordMismatch');
    return errs;
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const fullName = ((formData.get('fullName') as string) ?? '').trim();
    const email = ((formData.get('email') as string) ?? '').trim();
    const password = (formData.get('password') as string) ?? '';
    const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

    const errs = validate(fullName, email, password, confirmPassword);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          setError(t('errorEmailInUse'));
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div
        className="flex flex-col items-center gap-4 py-4 text-center"
        style={{ animation: 'loginSlideUp 0.3s ease-out' }}
      >
        <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <svg
            className="h-7 w-7 text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="text-lg font-bold">{t('successTitle')}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">{t('successDesc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4" noValidate>
      {/* Global error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
          style={{ animation: 'loginSlideUp 0.25s ease-out' }}
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium">
          {t('fullName')}
        </Label>
        <Input
          type="text"
          name="fullName"
          id="fullName"
          placeholder={t('fullNamePlaceholder')}
          autoComplete="name"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.fullName}
          aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
          className={
            fieldErrors.fullName
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.fullName && (
          <p
            id="fullName-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className="text-sm font-medium">
          {t('email')}
        </Label>
        <Input
          type="email"
          name="email"
          id="reg-email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
          className={
            fieldErrors.email
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.email && (
          <p
            id="reg-email-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className="text-sm font-medium">
          {t('password')}
        </Label>
        <Input
          type="password"
          name="password"
          id="reg-password"
          placeholder={t('passwordPlaceholder')}
          autoComplete="new-password"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
          className={
            fieldErrors.password
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.password && (
          <p
            id="reg-password-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          {t('confirmPassword')}
        </Label>
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder={t('confirmPasswordPlaceholder')}
          autoComplete="new-password"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
          className={
            fieldErrors.confirmPassword
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.confirmPassword && (
          <p
            id="confirmPassword-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-1 relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 text-white"
              style={{ animation: 'spin 0.75s linear infinite' }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {t('signingUp')}
          </span>
        ) : (
          t('signUp')
        )}
      </Button>
    </form>
  );
}
