'use client';

import { createClient } from '@/utils/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function EmailAndPasswordLogin() {
  const supabase = createClient();
  const locale = useLocale();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(email: string, password: string) {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'E-posta adresi gereklidir.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Geçerli bir e-posta adresi girin.';
    if (!password) errs.password = 'Şifre gereklidir.';
    else if (password.length < 6) errs.password = 'Şifre en az 6 karakter olmalıdır.';
    return errs;
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const password = formData.get('password') as string;

    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
        } else if (msg.includes('email not confirmed')) {
          setError('E-posta adresinizi doğrulamadınız. Lütfen gelen kutunuzu kontrol edin.');
        } else if (msg.includes('too many requests')) {
          setError('Çok fazla deneme yaptınız. Lütfen birkaç dakika bekleyin.');
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.user) {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError('Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4" noValidate>
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

      {/* Email field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          E-posta
        </Label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          className={
            fieldErrors.email
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.email && (
          <p
            id="email-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Şifre
          </Label>
          <a
            href="#"
            className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
          >
            Şifremi Unuttum
          </a>
        </div>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? 'password-error' : undefined}
          className={
            fieldErrors.password
              ? 'border-red-500/60 focus-visible:ring-red-500/40 bg-red-500/5'
              : ''
          }
        />
        {fieldErrors.password && (
          <p
            id="password-error"
            className="text-xs text-red-400"
            style={{ animation: 'loginSlideUp 0.2s ease-out' }}
          >
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-emerald-500 dark:hover:bg-emerald-400"
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
            Giriş yapılıyor…
          </span>
        ) : (
          'Giriş Yap'
        )}
      </Button>
    </form>
  );
}

