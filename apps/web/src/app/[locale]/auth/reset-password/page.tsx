'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const locale = useLocale();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsCheckingSession(false);
    }
    checkSession();
  }, [supabase]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch {
      setError('Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Subtle brand color accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 border rounded-3xl bg-card shadow-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 mb-2 shadow-lg shadow-emerald-500/5">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Yeni Şifre Belirleyin</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hesabınız için yeni bir şifre girin. Güncelleme sonrası otomatik olarak yönlendirileceksiniz.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Şifreniz Başarıyla Güncellendi!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              3 saniye içinde Dashboard sayfasına yönlendiriliyorsunuz...
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl cursor-pointer"
            >
              Hemen Dashboard'a Git <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm font-medium">
                Yeni Şifre
              </Label>
              <Input
                id="new-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Yeni Şifre (Tekrar)
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </span>
              ) : (
                'Şifreyi Güncelle'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
