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
  UploadCloud,
  FileText,
  Check,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchProfiles } from '@/services/profileService';
import { extractTextFromPdfBuffer } from '@/utils/pdfParser';
import { useProfiles } from '@/hooks/useProfile';
import { useCreateAtsScan } from '@/hooks/useAtsScan';
import { useGenerateResume } from '@/hooks/useResume';
import { useQueryClient } from '@tanstack/react-query';
import { Profile, AtsScanDto } from '@/types';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface QuickAtsScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAtsScanModal: React.FC<QuickAtsScanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const tDetail = useTranslations('atsScanDetail');
  const { session } = useAuth();
  const token = session?.access_token;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  
  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedCvText, setUploadedCvText] = useState<string>('');

  const [jobLink, setJobLink] = useState('');
  const [jobText, setJobText] = useState('');

  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AtsScanDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      setIsLoadingProfiles(true);
      fetchProfiles(token)
        .then((profs) => {
          setProfiles(profs || []);
        })
        .finally(() => setIsLoadingProfiles(false));
    }
  }, [isOpen, token]);

  // Handle CV File Upload (PDF, DOCX, TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSelectedProfileId(''); // Explicitly clear selected profile when user uploads a CV file!

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setUploadedCvText(content || '');
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const buffer = await file.arrayBuffer();
        const extractedText = await extractTextFromPdfBuffer(buffer);
        if (extractedText && extractedText.length > 20) {
          setUploadedCvText(extractedText.slice(0, 8000));
        } else {
          setUploadedCvText(`CV Document: ${file.name}`);
        }
      } catch (err) {
        console.error('Failed to parse PDF:', err);
        setUploadedCvText(`CV Document: ${file.name}`);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const decoded = decoder.decode(buffer);
          // Strip binary controls, null bytes, and non-printable stream markers
          const cleanText = decoded
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
            .replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          setUploadedCvText(cleanText.length > 20 ? cleanText.slice(0, 8000) : `CV Document: ${file.name}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createAtsScanMutation = useCreateAtsScan();
  const generateResumeMutation = useGenerateResume();

  const handleAnalyze = async () => {
    if (!selectedProfileId && !uploadedCvText.trim()) {
      setErrorMsg('Lütfen bir profil seçin veya bir CV dosyası yükleyin.');
      return;
    }
    if (!jobLink.trim() && !jobText.trim()) {
      setErrorMsg('Lütfen bir iş ilanı linki veya metni giriniz.');
      return;
    }

    if (!token) return;

    setErrorMsg(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Combine uploaded CV text with analysis if provided
      const customJobText = uploadedCvText.trim()
        ? `[CANDIDATE CV ATTACHED: ${uploadedFileName}]\n${uploadedCvText}\n\n[TARGET JOB REQUIREMENT]\n${jobText.trim()}`
        : jobText.trim() || undefined;

      const res = await createAtsScanMutation.mutateAsync({
        data: {
          externalJobLink: jobLink.trim(),
          profileId: selectedProfileId,
          jobDescriptionText: customJobText,
        },
        token,
      });

      if (res) {
        setResult(res);
      } else {
        setErrorMsg('ATS analizi gerçekleştirilemedi. Lütfen tekrar deneyiniz.');
      }
    } catch (err) {
      console.error('Quick ATS Scan error:', err);
      setErrorMsg('Bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTailoredCv = async () => {
    if (!selectedProfileId || !jobLink.trim() || isGenerating || !token) return;
    setIsGenerating(true);
    try {
      const newResume = await generateResumeMutation.mutateAsync({
        data: {
          externalJobLink: jobLink.trim(),
          profileId: selectedProfileId,
        },
        token,
      });
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
            Profilinizin hedef iş ilanıyla uyum skorunu saniyeler içinde test edin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* 1. PROFILE SELECTION CARDS & CV FILE UPLOAD */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                <User className="h-4 w-4 text-primary" /> Analiz Edilecek Profil Veya CV Dosyası
              </label>

              {isLoadingProfiles ? (
                <div className="flex items-center justify-center py-6 border border-border rounded-2xl bg-muted/20 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Profiler yükleniyor...
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Visual Profile Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profiles.map((p) => {
                      const isSelected = selectedProfileId === p.id && !uploadedFileName;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setUploadedFileName(null);
                            setUploadedCvText('');
                          }}
                          className={`relative flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                              : 'border-border bg-muted/30 hover:bg-muted/60'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-foreground truncate">
                              {p.profileName || 'Varsayılan Profil'}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {p.fullName || p.title || 'Profil Detayı'}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* File Upload Option (PDF, DOCX, TXT) */}
                  <div className="relative mt-1">
                    <label className={`flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed text-xs cursor-pointer transition-all ${
                      uploadedFileName
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                        : 'border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground'
                    }`}>
                      {uploadedFileName ? (
                        <>
                          <FileText className="h-4 w-4 text-amber-500" />
                          <span>Yüklenen CV: {uploadedFileName}</span>
                          <span className="text-[10px] ml-auto underline" onClick={(e) => {
                            e.preventDefault();
                            setUploadedFileName(null);
                            setUploadedCvText('');
                          }}>Kaldır</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 text-primary" />
                          <span>Veya Bilgisayarınızdan CV Yükleyin (.PDF, .DOCX, .TXT)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 2. TIP BANNER (İlan Metni Önerisi) */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs leading-relaxed">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-bold">Önemli İpucu:</span> İş ilanı linkleri bazı sitelerde (LinkedIn, Kariyer.net vb.) oturum engeline takılabilir. <strong className="underline decoration-amber-500/40">İlan metnini kopyalayıp aşağıdaki kutuya yapıştırmanız %100 kesinlikte sonuç verir.</strong>
              </div>
            </div>

            {/* 3. JOB LINK INPUT */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <Link2 className="h-4 w-4 text-primary" /> İş İlanı Linki (URL)
              </label>
              <Input
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/123456"
                className="text-xs h-10 rounded-2xl"
              />
            </div>

            {/* 4. JOB TEXT INPUT */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                İlan Metnini Doğrudan Yapıştırın (Önerilen)
              </label>
              <Textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="İş tanımı, aranan nitelikler ve pozisyon gereksinimlerini buraya yapıştırın..."
                rows={3}
                className="text-xs rounded-2xl"
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!jobLink.trim() && !jobText.trim())}
            className="w-full h-11 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
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
                    {result.jobTitle || 'Hedef İlan'}
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-1">
                <Button
                  onClick={() => {
                    onClose();
                    router.push(`/dashboard/ats-scan/${result.id}`);
                  }}
                  variant="outline"
                  className="w-full h-10 rounded-2xl font-bold text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                >
                  <BarChart2 className="h-4 w-4 mr-2 text-amber-500" />
                  <span>{tDetail('openDetailedReport')}</span>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>

                {jobLink.trim() && selectedProfileId && (
                  <Button
                    onClick={handleCreateTailoredCv}
                    disabled={isGenerating}
                    className="w-full h-11 rounded-2xl font-bold text-xs bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
