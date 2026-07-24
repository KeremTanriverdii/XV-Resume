'use client';

import { useState, useEffect } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from '../../../i18n/routing';
import { SelectProfile } from '@/components/clientpages/SelectProfile';
import { TemplateSelector } from '@/components/resume/TemplateSelectorModal';
import { TemplateId, ColorThemeId } from '@/components/resume/ResumeTemplates';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { generateResume } from '@/services/resumeService';
import { formatCompanyAndRole } from '@/utils/formatTitle';
import { PaddleSubscribeModal } from '@/components/payment/PaddleSubscribeModal';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const tResume = useTranslations('resume');
  const [jobLink, setJobLink] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [selectedColor, setSelectedColor] = useState<ColorThemeId>('blue');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Subscription and Trial states
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Trial');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [canGenerateResume, setCanGenerateResume] = useState<boolean>(true);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState<boolean>(false);
  
  const addSession = useResumeStore((state) => state.addSession);
  const router = useRouter();
  
  const profile = useAuth();
  const token = profile.session?.access_token;

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then((res) => res.json())
    .then((data) => {
      setSubscriptionStatus(data.status);
      setCanGenerateResume(data.canGenerateResume);
      if (data.trialsEndsAt) {
        const diff = new Date(data.trialsEndsAt).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(days > 0 ? days : 0);
      }
    })
    .catch((err) => console.error("Error loading subscription status:", err));
  }, [token]);

  const handleStartResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobLink.trim() || !selectedProfileId || !token) return;

    if (!canGenerateResume) {
      setIsSubscribeModalOpen(true);
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await generateResume({
        externalJobLink: jobLink,
        profileId: selectedProfileId,
        selectedLanguagesForGeneration: ["tr", "en"]
      }, token);
      
      if (result) {
        // Add to Zustand store to sync immediately
        const title = formatCompanyAndRole(result.translations[0]?.title, result.externalJobLink);
        addSession({
          id: result.id,
          jobTitle: title,
          jobLink: result.externalJobLink,
          createdAt: result.createdAt,
        });
        setJobLink('');
        setSelectedProfileId(null);
        // Navigate to the newly generated resume session with selected template & color
        router.push(`/dashboard/resume/${result.id}?template=${selectedTemplate}&color=${selectedColor}`);
      }
    } catch (err) {
      console.error("AI CV Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-8 mt-8 lg:mt-12">
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto w-full">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Briefcase className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('createTitle')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('createSubtitle')}
        </p>
        
        {/* Trial Active Banner */}
        {canGenerateResume && subscriptionStatus === 'Trial' && trialDaysLeft !== null && (
          <div className="w-full max-w-2xl p-3 mt-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
              <div className="text-left text-xs sm:text-sm">
                <span className="font-medium">Trial Active</span>: You have <strong className="font-extrabold">{trialDaysLeft} days</strong> left in your free trial.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline transition-colors shrink-0 cursor-pointer"
            >
              Upgrade to Pro →
            </button>
          </div>
        )}

        {/* Expired Subscription Alert */}
        {!canGenerateResume && (
          <div className="w-full max-w-2xl p-4 mt-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-left text-xs sm:text-sm">
                <p className="font-semibold">Subscription Expired</p>
                <p className="opacity-95">Your 14-day free trial or monthly subscription has expired.</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              variant="destructive"
              size="sm"
              className="font-bold shrink-0 rounded-full cursor-pointer"
            >
              Upgrade to Pro ✨
            </Button>
          </div>
        )}

        <form onSubmit={handleStartResume} className="mt-6 flex flex-col w-full max-w-2xl items-center gap-4">
          <div className="relative flex-1 w-full">
            <Input 
              type="url" 
              placeholder={t('placeholderUrl')} 
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              required
              disabled={isGenerating || !canGenerateResume}
              className="w-full px-5 py-6 text-base rounded-full border-muted-foreground/30 shadow-sm focus-visible:ring-primary/50"
            />
          </div>

          <SelectProfile token={token} selectedProfileId={selectedProfileId} onSelect={setSelectedProfileId} />
          
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            tTemplates={tResume.raw('templates')}
            tColors={tResume.raw('colors')}
          />
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto rounded-full py-6 px-10 shadow-md group transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
            disabled={!jobLink.trim() || !selectedProfileId || isGenerating || !canGenerateResume}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="font-semibold text-base">{t('generating') || 'Oluşturuluyor...'}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-base">{t('btnStartAi')}</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </div>
      
      {/* Decorative Empty State Container */}
      <div className="mt-8 flex-1 rounded-3xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full">
         <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-3">
            <span className="text-xl">✨</span>
         </div>
         <h3 className="font-semibold text-lg mb-1">{t('readyTitle')}</h3>
         <p className="text-sm text-muted-foreground max-w-md">
            {t('readySubtitle')}
         </p>
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
