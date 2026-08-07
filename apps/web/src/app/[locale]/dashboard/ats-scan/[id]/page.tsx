'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAtsScan, useDeleteAtsScan } from '@/hooks/useAtsScan';
import { useGenerateResume } from '@/hooks/useResume';
import {
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

const parseBold = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-bold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
};

const renderFormattedFeedback = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Markdown Headings (# Heading or ## Heading)
        if (trimmed.startsWith('#')) {
          const cleanHeading = trimmed.replace(/^#+\s*/, '');
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-black text-foreground border-b border-amber-500/20 pb-1.5 mt-6 mb-2 flex items-center gap-2 first:mt-0"
            >
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{parseBold(cleanHeading)}</span>
            </h3>
          );
        }

        // Section Headers ending with colon (e.g. "Genel Değerlendirme:", "Önemli Tavsiyeler:")
        if (
          trimmed.endsWith(':') &&
          trimmed.length < 80 &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*')
        ) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-extrabold text-foreground mt-5 mb-1.5 flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              <span>{parseBold(trimmed)}</span>
            </h4>
          );
        }

        // Bullet list items (- item or * item)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span className="text-foreground/90 font-medium text-sm">
                {parseBold(trimmed.slice(2))}
              </span>
            </div>
          );
        }

        // Numbered list items (1. item)
        if (/^\d+\./.test(trimmed)) {
          const num = trimmed.split('.')[0];
          const content = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5">
              <span className="font-extrabold text-amber-500 text-xs shrink-0 mt-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {num}.
              </span>
              <span className="text-foreground/90 font-medium text-sm">
                {parseBold(content)}
              </span>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p
            key={idx}
            className="text-foreground/85 font-medium text-sm leading-relaxed"
          >
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
};
export default function AtsScanDetailPage() {
  const t = useTranslations('atsScanDetail');
  const locale = useLocale();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { session } = useAuth();
  const token = session?.access_token;

  const { data: scan, isLoading } = useAtsScan(id, token);
  const deleteMutation = useDeleteAtsScan();

  const generateMutation = useGenerateResume();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDelete = async () => {
    if (!scan || !token) return;
    if (!window.confirm(t('delete') + '?')) return;

    try {
      await deleteMutation.mutateAsync({ id: scan.id, token });
      toast.success(t('delete') + '!');
      router.push('/dashboard');
    } catch {
      toast.error(t('delete') + ' error');
    }
  };

  const handleCreateCv = async () => {
    if (!scan || !token || !scan.profileId) return;
    const jobInput = scan.externalJobLink || scan.jobDescription || scan.jobTitle;
    if (!jobInput) {
      toast.error('İş ilanı veya açıklaması bulunamadı.');
      return;
    }
    setIsGenerating(true);
    try {
      const newResume = await generateMutation.mutateAsync({
        data: {
          externalJobLink: jobInput,
          profileId: scan.profileId,
        },
        token,
      });
      if (newResume) {
        router.push(`/dashboard/resume/${newResume.id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('CV oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-muted-foreground">
          {t('loadingReport')}
        </span>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-2">
          <BarChart2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">{t('notFoundTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('notFoundDesc')}</p>
        <Button asChild className="rounded-full mt-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToDashboard')}
          </Link>
        </Button>
      </div>
    );
  }

  const scoreColor =
    scan.matchPercentage >= 75
      ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10'
      : scan.matchPercentage >= 50
        ? 'border-amber-500 text-amber-500 bg-amber-500/10'
        : 'border-rose-500 text-rose-500 bg-rose-500/10';

  return (
    <div className="flex flex-col gap-6 p-2 max-w-5xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full h-9 w-9 shrink-0"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-amber-500 shrink-0" />
              {scan.jobTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {new Date(scan.createdAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {scan.profile ? (
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <User className="h-3.5 w-3.5 text-primary shrink-0" />
                  {scan.profile.profileName}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground font-medium">
                  <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  {t('uploadedCvDocument')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {scan.externalJobLink && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full gap-1.5 cursor-pointer"
            >
              <a
                href={scan.externalJobLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t('jobLink')}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-full gap-1.5 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 text-white" />
                <span className="text-white">{t('delete')}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Score Card */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('aiRatingTitle')}
          </span>
          <h2 className="text-2xl font-black text-foreground">
            {t('matchScore', { percentage: scan.matchPercentage })}
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg">
            {t('scoreDesc')}
          </p>
        </div>

        <div
          className={`h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center font-black text-2xl shrink-0 shadow-inner ${scoreColor}`}
        >
          <span>%{scan.matchPercentage}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            ATS
          </span>
        </div>
      </div>

      {/* Categorized Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t('matchedSkills')} ({scan.matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {scan.matchedSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground">-</span>
            ) : (
              scan.matchedSkills.map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-500/20 shadow-2xs"
                >
                  ✓ {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('missingSkills')} ({scan.missingSkills.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {scan.missingSkills.length === 0 ? (
              <span className="text-xs text-muted-foreground">-</span>
            ) : (
              scan.missingSkills.map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 text-xs font-bold border border-rose-500/20 shadow-2xs"
                >
                  ! {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Critical Missing Skills if any */}
        {scan.criticalMissingSkills &&
          scan.criticalMissingSkills.length > 0 && (
            <div className="p-5 rounded-2xl border border-red-600/40 bg-red-600/10 flex flex-col gap-3 md:col-span-2">
              <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                {t('criticalMissingSkills')} (
                {scan.criticalMissingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {scan.criticalMissingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-red-600/20 text-red-900 dark:text-red-200 text-xs font-extrabold border border-red-600/30 shadow-2xs"
                  >
                    ⚠️ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Recommended Missing Skills if any */}
        {scan.recommendedMissingSkills &&
          scan.recommendedMissingSkills.length > 0 && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-3 md:col-span-2">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                {t('recommendedMissingSkills')} (
                {scan.recommendedMissingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {scan.recommendedMissingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-500/20"
                  >
                    💡 {s}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Rich AI Feedback Report Card */}
      {scan.atsFeedback && (
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-4">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2 border-b pb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {t('aiReportTitle')}
          </h3>
          {renderFormattedFeedback(scan.atsFeedback)}
        </div>
      )}

      {/* Create CV CTA Button */}
      {scan.profileId && (
        <Button
          onClick={handleCreateCv}
          disabled={isGenerating}
          className="w-full h-12 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-5 w-5 mr-2 text-amber-300 animate-pulse" />
          )}
          <span>{t('createTailoredCv')}</span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      )}
    </div>
  );
}
