'use client';

import { useState } from 'react';
import { useResumeStore } from '../../../store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from '../../../i18n/routing';
import { SelectProfile } from '@/components/clientpages/SelectProfile';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { generateResume } from '@/services/resumeService';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [jobLink, setJobLink] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const addSession = useResumeStore((state) => state.addSession);
  const router = useRouter();
  
  const profile = useAuth();
  const token = profile.session?.access_token;

  const handleStartResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobLink.trim() || !selectedProfileId || !token) return;
    
    setIsGenerating(true);
    try {
      const result = await generateResume({
        externalJobLink: jobLink,
        profileId: selectedProfileId,
        selectedLanguagesForGeneration: ["tr", "en"]
      }, token);
      
      if (result) {
        // Add to Zustand store to sync immediately (the sidebar mount effect will also sync)
        addSession(jobLink);
        setJobLink('');
        setSelectedProfileId(null);
        // Navigate to the newly generated resume session
        router.push(`/dashboard/resume/${result.id}`);
      }
    } catch (err) {
      console.error("AI CV Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full gap-8 mt-12 lg:mt-20">
      <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto w-full">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Briefcase className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('createTitle')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('createSubtitle')}
        </p>
        
        <form onSubmit={handleStartResume} className="mt-8 flex flex-col w-full max-w-xl items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input 
              type="url" 
              placeholder={t('placeholderUrl')} 
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
              required
              disabled={isGenerating}
              className="w-full px-5 py-6 text-base rounded-full border-muted-foreground/30 shadow-sm focus-visible:ring-primary/50"
            />
          </div>
          <SelectProfile token={token} selectedProfileId={selectedProfileId} onSelect={setSelectedProfileId} />
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto rounded-full py-6 px-8 shadow-md group transition-all hover:scale-105 active:scale-95 cursor-pointer"
            disabled={!jobLink.trim() || !selectedProfileId || isGenerating}
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
      <div className="mt-16 flex-1 rounded-3xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center p-12 text-center max-w-4xl mx-auto w-full">
         <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">✨</span>
         </div>
         <h3 className="font-semibold text-xl mb-2">{t('readyTitle')}</h3>
         <p className="text-sm text-muted-foreground max-w-md">
            {t('readySubtitle')}
         </p>
      </div>
    </div>
  );
}
