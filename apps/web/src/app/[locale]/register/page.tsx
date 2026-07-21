'use client';
import GoogleLogin from '@/components/auth/GoogleLogin';
import GithubLogin from '@/components/auth/GithubLogin';
import EmailAndPasswordRegister from '@/components/auth/EmailAndPasswordRegister';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations('register');

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel: animated hero ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a12 50%, #091219 100%)',
        }}
      >
        {/* Mesh grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating orb 1 — top-right */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 380,
            height: 380,
            top: '-60px',
            right: '-80px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.20) 0%, transparent 70%)',
            animation: 'orbFloat 10s ease-in-out infinite',
          }}
        />

        {/* Floating orb 2 — bottom-left */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 320,
            height: 320,
            bottom: '-50px',
            left: '-60px',
            background: 'radial-gradient(circle, rgba(20,184,166,0.16) 0%, transparent 70%)',
            animation: 'orbFloat2 12s ease-in-out infinite',
          }}
        />

        {/* Floating orb 3 — center-left */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 200,
            height: 200,
            top: '55%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)',
            animation: 'orbFloat 7s ease-in-out infinite 2s',
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-12 text-center flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/10">
              <svg
                className="h-6 w-6 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4.5L10 19.5L13.5 11" />
                <path d="M20 4.5L14 19.5" />
              </svg>
            </div>
            <span className="font-extrabold text-4xl tracking-tight text-white">
              XV<span className="text-emerald-400 font-medium">Resume</span>
            </span>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl font-bold text-white/90 leading-snug max-w-xs">
            {t('heroTagline')}
          </h2>
          <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
            {t('heroDesc')}
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-3 mt-2 w-full max-w-xs text-left">
            {[
              { num: '1', label: 'Hesabını oluştur' },
              { num: '2', label: 'Profilini doldur' },
              { num: '3', label: 'AI ile CV oluştur' },
            ].map(({ num, label }) => (
              <div key={num} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{num}</span>
                </div>
                <span className="text-sm text-zinc-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom shimmer line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
          }}
        />
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div
          className="w-full max-w-md py-4"
          style={{ animation: 'loginSlideUp 0.4s ease-out' }}
        >
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <svg
                className="h-5 w-5 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4.5L10 19.5L13.5 11" />
                <path d="M20 4.5L14 19.5" />
              </svg>
            </div>
            <span className="font-extrabold text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
              XV<span className="text-emerald-500 font-medium">Resume</span>
            </span>
          </div>

          {/* Card */}
          <div className="p-8 border rounded-2xl bg-card shadow-xl shadow-black/5 dark:shadow-black/20">
            <h1 className="text-center text-2xl font-bold mb-1">{t('createAccount')}</h1>
            <p className="text-center text-muted-foreground text-sm mb-7">
              {t('createAccountSubtitle')}
            </p>

            <div className="space-y-4">
              <EmailAndPasswordRegister />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">veya</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2.5">
                <GoogleLogin />
                <GithubLogin />
              </div>

              <p className="text-center text-sm text-muted-foreground pt-1">
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href="/login"
                  className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                >
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
