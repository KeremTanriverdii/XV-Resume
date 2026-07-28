'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { useLocale } from 'next-intl';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const supabase = createClient();
  const locale = useLocale();

  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/${locale}/auth/callback?next=/${locale}/auth/reset-password`;

      const { error: authError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });

      if (authError) {
        if (authError.message.includes('rate limit') || authError.message.includes('too many requests')) {
          setError('Çok fazla istek gönderildi. Lütfen birkaç dakika bekleyip tekrar deneyin.');
        } else {
          setError(authError.message);
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Sıfırlama Bağlantısı Gönderildi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{email}</strong> adresine şifre sıfırlama bağlantısı içeren bir e-posta gönderdik. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
            </p>
            <Button
              onClick={handleClose}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl cursor-pointer"
            >
              Tamam
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-1.5 pr-4">
              <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-1">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Şifrenizi mi Unuttunuz?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hesabınıza ait e-posta adresinizi girin. Size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.
              </p>
            </div>

            {/* Global Error */}
            {error && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-sm font-medium">
                  E-posta Adresi
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sıfırlama Bağlantısı Gönder</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
