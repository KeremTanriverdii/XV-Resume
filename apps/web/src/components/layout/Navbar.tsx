'use client';

import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/providers/AuthProvider';
import { useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Globe, Sun, Moon, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useResumeStore } from '@/store/useResumeStore';

export default function Navbar() {
  const { session, user, isLoading } = useAuth();
  const setSessions = useResumeStore((state) => state.setSessions);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = (lang: string) => {
    router.replace(pathname, { locale: lang as any });
  };

  const availableLanguages = [
    { name: 'Türkçe', code: 'tr' },
    { name: 'English', code: 'en' },
    { name: 'Deutsch', code: 'de' },
    { name: 'Español', code: 'es' },
    { name: 'Français', code: 'fr' },
    { name: '日本語', code: 'jp' },
  ];

  const getUserDisplayName = (usr: any) => {
    if (!usr) return 'Kullanıcı';
    const meta = usr.user_metadata || {};
    const name = meta.full_name || meta.name || meta.display_name;
    if (name && typeof name === 'string' && name.trim() !== '') {
      return name.trim();
    }
    if (usr.email && typeof usr.email === 'string' && usr.email.trim() !== '') {
      return usr.email.split('@')[0];
    }
    return 'Kullanıcı';
  };

  const handleLogout = async () => {
    try {
      setSessions([]);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      window.location.href = `/${locale}/login`;
    }
  };

  return (
    <header className="w-full bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-900 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
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
            <span className="font-black text-2xl tracking-tight text-zinc-900 dark:text-zinc-100">
              XV<span className="text-emerald-500 font-medium">Resume</span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 md:gap-6">
          {/* Theme Toggle (Black & White Switcher) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            )}
          </Button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl px-3.5 py-2"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span className="font-semibold text-xs">
                  {locale.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300">
              {availableLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 focus:text-zinc-100 transition-colors"
                >
                  <span className="text-xs">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Navigation */}
          {session ? (
            <>
              <Link
                href="/dashboard/profiles"
                locale={locale as any}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-4 py-2 text-xs transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>CV Oluştur</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl px-3.5 py-2"
                  >
                    <User className="mr-1 h-4 w-4" />
                    <span className="font-semibold text-xs">
                      {getUserDisplayName(user)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300">
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profiles')}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 focus:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs">CV Profil Oluşturucu</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 focus:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs">Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 focus:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs">Ayarlar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 focus:text-zinc-100 transition-colors"
                  >
                    <span className="text-xs">Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/dashboard/profiles"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-5 py-2 text-xs transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>CV Oluştur</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
