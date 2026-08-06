'use client';

import { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  Zap,
  Link2,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { SelectProfile } from '@/components/clientpages/SelectProfile';
import { TemplateId, ColorThemeId } from '@/components/resume/ResumeTemplates';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { generateResume } from '@/services/resumeService';
import { formatCompanyAndRole } from '@/utils/formatTitle';
import { LanguageGenerationSelector } from '@/components/resume/LanguageGenerationSelector';
import { useGenerateResume } from '@/hooks/useResume';
import { AiRegeneratingOverlay } from '@/components/resume/AiRegeneratingOverlay';

const PaddleSubscribeModal = dynamic(
  () =>
    import('@/components/payment/PaddleSubscribeModal').then(
      (m) => m.PaddleSubscribeModal,
    ),
  { ssr: false },
);

export default function DashboardClient() {
  const t = useTranslations('Dashboard');
  const tSub = useTranslations('subscription');
  const generateMutation = useGenerateResume();
  const isGenerating = generateMutation.isPending;
  const [jobLink, setJobLink] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );
  const [selectedTemplate] = useState<TemplateId>('modern');
  const [selectedColor] = useState<ColorThemeId>('blue');
  const [selectedLangsForGen, setSelectedLangsForGen] = useState<string[]>([
    'tr',
    'en',
  ]);

  // Subscription and Trial states
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Trial');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [canGenerateResume, setCanGenerateResume] = useState<boolean>(true);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] =
    useState<boolean>(false);

  const addSession = useResumeStore((state) => state.addSession);
  const router = useRouter();

  const profile = useAuth();
  const token = profile.session?.access_token;

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSubscriptionStatus(data.status);
          setCanGenerateResume(data.canGenerateResume);
          if (data.trialsEndsAt) {
            const diff =
              new Date(data.trialsEndsAt).getTime() - new Date().getTime();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            setTrialDaysLeft(days > 0 ? days : 0);
          }
        }
      })
      .catch((err) =>
        console.warn(
          'Payment status endpoint unavailable:',
          err?.message || err,
        ),
      );
  }, [token]);

  const handleStartResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobLink.trim() || !selectedProfileId || !token) return;

    if (!canGenerateResume) {
      setIsSubscribeModalOpen(true);
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        data: {
          externalJobLink: jobLink,
          profileId: selectedProfileId,
          selectedLanguagesForGeneration: selectedLangsForGen,
        },
        token,
      });

      if (result) {
        const title = formatCompanyAndRole(
          result.translations[0]?.title,
          result.externalJobLink,
        );
        addSession({
          id: result.id,
          jobTitle: title,
          jobLink: result.externalJobLink,
          createdAt: result.createdAt,
        });

        setJobLink('');
        setSelectedProfileId(null);
        router.push(
          `/dashboard/resume/${result.id}?template=${selectedTemplate}&color=${selectedColor}`,
        );
      }
    } catch (err) {
      console.error('AI CV Generation error:', err);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <AiRegeneratingOverlay isOpen={isGenerating} />
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider shadow-xs backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span>{t('badgeText')}</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-700 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent max-w-2xl leading-tight">
          {t('createTitle')}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {t('createSubtitle')}
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-2xl mt-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <span className="truncate">{t('features.resume')}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <span className="truncate">{t('features.coverLetter')}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors">
            <div className="p-1 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span className="truncate">{t('features.coldMessage')}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 transition-colors">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <span className="truncate">{t('features.atsScore')}</span>
          </div>
        </div>

        {/* Trial Active Banner */}
        {canGenerateResume &&
          subscriptionStatus === 'Trial' &&
          trialDaysLeft !== null && (
            <div className="w-full max-w-2xl p-3 mt-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
                <div className="text-left text-xs sm:text-sm">
                  <span className="font-medium">
                    {tSub('trialActiveTitle')}
                  </span>
                  : {tSub('trialActiveText', { days: trialDaysLeft })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubscribeModalOpen(true)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline transition-colors shrink-0 cursor-pointer"
              >
                {tSub('upgradeToPro')}
              </button>
            </div>
          )}

        {/* Expired Subscription Alert */}
        {!canGenerateResume && (
          <div className="w-full max-w-2xl p-4 mt-2 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-left text-xs sm:text-sm">
                <p className="font-semibold">
                  {tSub('subscriptionExpiredTitle')}
                </p>
                <p className="opacity-95">{tSub('subscriptionExpiredText')}</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              variant="destructive"
              size="sm"
              className="font-bold shrink-0 rounded-full cursor-pointer active:scale-[0.99] transition-all hover:scale-[1.01] text-black dark:text-white"
            >
              {tSub('upgradeToProBadge')}
            </Button>
          </div>
        )}

        {/* Main Creation Card Form */}
        <form
          onSubmit={handleStartResume}
          className="mt-4 flex flex-col w-full max-w-2xl items-center gap-4 bg-card/60 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-border/80 shadow-lg"
        >
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
              <Link2 className="h-4 w-4" />
            </div>
            <Input
              type="url"
              placeholder={t('placeholderUrl')}
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              required
              disabled={isGenerating || !canGenerateResume}
              className="w-full pl-11 pr-5 py-6 text-sm sm:text-base rounded-2xl border-border/80 shadow-xs focus-visible:ring-indigo-500/50 bg-background/80"
            />
          </div>

          <SelectProfile
            token={token}
            selectedProfileId={selectedProfileId}
            onSelect={setSelectedProfileId}
          />

          <div className="w-full bg-background/70 border border-border/60 p-4 rounded-2xl shadow-2xs">
            <LanguageGenerationSelector
              selectedLanguages={selectedLangsForGen}
              onChange={setSelectedLangsForGen}
              disabled={isGenerating || !canGenerateResume}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-2xl py-6 px-10 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 group transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-2"
            disabled={
              !jobLink.trim() ||
              !selectedProfileId ||
              isGenerating ||
              !canGenerateResume
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-semibold text-base">
                  {t('generating') || 'Oluşturuluyor...'}
                </span>
              </>
            ) : (
              <>
                <span className="font-bold text-base">{t('btnStartAi')}</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      <PaddleSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        userId={profile.user?.id}
        userEmail={profile.user?.email}
      />
    </div>
  );
}
