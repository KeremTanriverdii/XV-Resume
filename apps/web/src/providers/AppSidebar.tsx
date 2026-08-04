'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useResumeStore, ResumeSession } from '@/store/useResumeStore';
import { deleteResume, fetchResumes } from '@/services/resumeService';
import {
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
  Globe,
  Laptop,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Trash2,
  Zap,
  Mail,
  Send,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './AuthProvider';

const QuickAtsScanModal = dynamic(
  () =>
    import('@/components/dashboard/QuickAtsScanModal').then(
      (m) => m.QuickAtsScanModal,
    ),
  { ssr: false },
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { formatCompanyAndRole } from '@/utils/formatTitle';

export function AppSidebar() {
  const { user, session } = useAuth();
  const token = session?.access_token;
  const { theme, setTheme } = useTheme();
  const { sessions, setSessions, removeSession } = useResumeStore();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  const [mounted, setMounted] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ResumeSession | null>(null);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);

  const openDeleteModal = (e: React.MouseEvent, sessionItem: ResumeSession) => {
    e.preventDefault();
    e.stopPropagation();
    setSessionToDelete(sessionItem);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const targetId = sessionToDelete.id;
    const previousSessions = [...sessions];

    // OPTIMISTIC UPDATE: Instantly remove session from local store
    removeSession(targetId);
    setSessionToDelete(null);

    if (pathname.includes(`/dashboard/resume/${targetId}`)) {
      router.push('/dashboard');
    }

    try {
      if (token) {
        await deleteResume(targetId, token);
      }
      toast.success(t('toast.deleteSuccess'));
    } catch (err) {
      console.error('Optimistic delete failed, rolling back:', err);
      // ROLLBACK ON FAILURE
      setSessions(previousSessions);
      toast.error(t('toast.deleteError'));
    }
  };

  // Avoid hydration mismatch by waiting for client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (token) {
      fetchResumes(token).then((resumes) => {
        const mappedSessions: ResumeSession[] = resumes.map((r) => {
          const prefTrans =
            r.translations.find((t) => t.languageCode === locale) ||
            r.translations[0];
          const calculatedTitle = formatCompanyAndRole(
            prefTrans?.title,
            r.externalJobLink,
          );

          return {
            id: r.id,
            jobTitle: calculatedTitle,
            jobLink: r.externalJobLink,
            createdAt: r.createdAt,
          };
        });
        setSessions(mappedSessions);
      });
    } else {
      setSessions([]);
    }
  }, [token, locale, setSessions]);

  const handleLogout = async () => {
    setSessions([]);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'tr' ? 'en' : 'tr';

    const cleanPath = pathname.startsWith(`/${locale}`)
      ? pathname.slice(locale.length + 1)
      : pathname;

    router.replace(cleanPath || '/', { locale: nextLocale });
  };

  const navigateSidebarItem = [
    {
      name: t('sidebar.my-resumes'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('sidebar.profiles'),
      href: '/dashboard/profiles',
      icon: LayoutTemplate,
    },
    {
      name: t('sidebar.outreach') || 'Cold Message & Cover Letter',
      href: '/dashboard/outreach',
      icon: Mail,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-emerald-400"
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
          <span className="font-black text-base tracking-tight text-zinc-900 dark:text-zinc-100">
            XV<span className="text-emerald-500 font-medium">Resume</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigateSidebarItem.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} prefetch={true}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Session History */}
        <SidebarGroup>
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => setIsAtsModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>{t('sidebar.atsScan') || 'Hızlı ATS Uyum Testi'}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-extrabold border border-amber-500/40 shadow-xs">
                PRO
              </span>
            </button>
          </div>
          <SidebarGroupLabel>{t('sidebar.recent-resumes')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sessions.length === 0 ? (
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  {t('sidebar.no-recent-resumes')}
                </div>
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem
                    key={session.id}
                    className="group/item relative flex items-center"
                  >
                    <SidebarMenuButton asChild className="pr-8">
                      <Link
                        href={`/dashboard/resume/${session.id}`}
                        prefetch={true}
                      >
                        <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{session.jobTitle}</span>
                      </Link>
                    </SidebarMenuButton>
                    <button
                      type="button"
                      onClick={(e) => openDeleteModal(e, session)}
                      title={t('sidebar.deleteConfirmTitle')}
                      className="absolute right-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Settings Dropdown at Bottom */}
      <SidebarFooter className="p-2">
        {(() => {
          const userName =
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split('@')[0] ||
            'User';
          const userEmail = user?.email || '';
          const userAvatar =
            user?.user_metadata?.avatar_url ||
            user?.user_metadata?.picture;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 text-left focus:outline-none hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors cursor-pointer">
                  <Avatar className="h-9 w-9">
                    {userAvatar && <AvatarImage src={userAvatar} />}
                    <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </span>
                    )}
                  </div>
                </button>
              </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56"
              align="end"
              side="top"
              sideOffset={8}
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {mounted ? (
                    theme === 'dark' ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : theme === 'light' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Laptop className="mr-2 h-4 w-4" />
                    )
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span>{t('settings.theme')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent sideOffset={7}>
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className={`cursor-pointer ${theme === 'light' ? 'bg-accent text-accent-foreground font-semibold' : ''}`}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      <span>{t('common.light')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className={`cursor-pointer ${theme === 'dark' ? 'bg-accent text-accent-foreground font-semibold' : ''}`}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      <span>{t('common.dark')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className={`cursor-pointer ${theme === 'system' ? 'bg-accent text-accent-foreground font-semibold' : ''}`}
                    >
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>{t('common.system')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Language Toggle */}
              <DropdownMenuItem
                onClick={toggleLanguage}
                className="cursor-pointer"
              >
                <Globe className="mr-2 h-4 w-4" />
                <span>{locale === 'tr' ? 'English' : 'Türkçe'}</span>
              </DropdownMenuItem>

              {/* Settings */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center w-full cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings.title')}</span>
                </Link>
              </DropdownMenuItem>

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center w-full cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('auth.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })()}
      </SidebarFooter>
      <QuickAtsScanModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
      />

      {/* Shadcn Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
              <Trash2 className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span>{t('sidebar.deleteConfirmTitle')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.deleteConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('sidebar.deleteConfirmCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSession}>
              {t('sidebar.deleteConfirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
