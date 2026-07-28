'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Zap,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Link2,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchProfiles } from '@/services/profileService';
import { analyzeAts, generateResume } from '@/services/resumeService';
import { Profile, AtsAnalysisResultDto } from '@/types';
import { useRouter } from '@/i18n/routing';

interface QuickAtsScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAtsScanModal: React.FC<QuickAtsScanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { session } = useAuth();
  const token = session?.access_token;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [jobLink, setJobLink] = useState('');
  const [jobText, setJobText] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AtsAnalysisResultDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchProfiles(token).then((profs) => {
        setProfiles(profs);
        if (profs.length > 0 && !selectedProfileId) {
          setSelectedProfileId(profs[0].id);
        }
      });
    }
  }, [isOpen, token, selectedProfileId]);

  const handleAnalyze = async () => {
    if (!selectedProfileId) {
      setErrorMsg('Lütfen önce bir profil seçiniz.');
      return;
    }
    if (!jobLink.trim() && !jobText.trim()) {
      setErrorMsg('Lütfen bir iş ilanı linki veya metni giriniz.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await analyzeAts(
        {
          externalJobLink: jobLink.trim(),
          profileId: selectedProfileId,
          jobDescriptionText: jobText.trim() || undefined,
        },
        token,
      );

      if (res) {
        setResult(res);
      } else {
        setErrorMsg(
          'ATS analizi gerçekleştirilemedi. Lütfen tekrar deneyiniz.',
        );
      }
    } catch (err) {
      console.error('Quick ATS Scan error:', err);
      setErrorMsg('Bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTailoredCv = async () => {
    if (!selectedProfileId || !jobLink.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const newResume = await generateResume(
        {
          externalJobLink: jobLink.trim(),
          profileId: selectedProfileId,
        },
        token,
      );
      if (newResume) {
        onClose();
        router.push(`/dashboard/resume/${newResume.id}`);
      }
    } catch (err) {
      console.error('Generate tailored CV error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border-border bg-background shadow-2xl p-6">
        <DialogHeader className="space-y-1.5 pb-3 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            Hızlı ATS Uyum Analizi
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Profilinizin hedef iş ilanıyla uyum skorunu saniyeler içinde test
            edin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5 text-primary" /> Profilinizi Seçin
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.profileName} ({p.fullName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <Link2 className="h-3.5 w-3.5 text-primary" /> İş İlanı Linki
                (URL)
              </label>
              <Input
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/123456"
                className="text-xs h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Veya İlan Metnini Doğrudan Yapıştırın
              </label>
              <Textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Aranan nitelikler ve pozisyon gereksinimleri..."
                rows={3}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!jobLink.trim() && !jobText.trim())}
            className="w-full h-11 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Yapay Zeka Analiz Ediyor...</span>
              </>
            ) : (
              <>
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>ATS Uyum Skorunu Hesapla</span>
              </>
            )}
          </Button>

          {/* Results Display */}
          {result && (
            <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-border animate-in fade-in duration-300">
              {/* Score & Job Title */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {result.scrapedJobTitle || 'Hedef İlan'}
                  </span>
                  <h4 className="text-base font-extrabold text-foreground">
                    %{result.matchPercentage} ATS Uyumluluğu
                  </h4>
                </div>
                <div className="h-14 w-14 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-lg font-black text-amber-500 shrink-0">
                  %{result.matchPercentage}
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Eşleşen Beceriler (
                    {result.matchedSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
                  <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" /> Eksik Beceriler (
                    {result.missingSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {result.missingSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-semibold"
                      >
                        ! {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Feedback */}
              {result.atsFeedback && (
                <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground block mb-1">
                    💡 AI Tavsiyesi:
                  </span>
                  {result.atsFeedback}
                </div>
              )}

              {/* CTA to Generate full CV */}
              {jobLink.trim() && (
                <Button
                  onClick={handleCreateTailoredCv}
                  disabled={isGenerating}
                  className="w-full h-11 rounded-xl font-bold text-xs bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all mt-1"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-amber-300 animate-pulse" />
                  )}
                  <span>Bu İlan İçin ATS Uyumlu CV Oluştur</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
