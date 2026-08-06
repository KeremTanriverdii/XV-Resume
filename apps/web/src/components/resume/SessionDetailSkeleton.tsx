'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileText,
  Calendar,
  ExternalLink,
  Save,
  Download,
  Trash2,
  Sparkles,
  Globe,
  Layers,
  Layout,
  Palette,
  RefreshCw,
  Briefcase,
  Mail,
  Send,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SessionDetailSkeleton() {
  const t = useTranslations('resume');

  return (
    <div className="flex flex-col gap-6 p-1 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="rounded-full h-9 w-9 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary/70 shrink-0" />
              <Skeleton className="h-6 w-48 sm:w-64 rounded-lg" />
            </h1>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Action Buttons Header Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="rounded-full gap-1.5"
          >
            <span>{t('jobLink')}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="rounded-full gap-1.5 border-emerald-500/30 text-emerald-600/70 dark:text-emerald-400/70"
          >
            <Save className="h-3.5 w-3.5 opacity-60" />
            <span>{t('save')}</span>
          </Button>

          <Button
            disabled
            className="rounded-full gap-2 bg-primary/80 text-primary-foreground"
          >
            <Download className="h-4 w-4 opacity-70" />
            <span>{t('downloadPdf')}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled
            className="rounded-full gap-1.5 opacity-80"
          >
            <Trash2 className="h-4 w-4 opacity-70" />
            <span>{t('delete')}</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid: Controls & Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (4 cols): AI Session Options Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500/80" />
              {t('aiSessionOptions')}
            </h3>

            {/* Dropdown 1: Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {t('language')}
              </label>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Dropdown 2: Version */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {t('version')}
              </label>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Template Selector Buttons */}
            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-primary" />
                {t('template')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  t('templates.modern'),
                  t('templates.executive'),
                  t('templates.sidebar'),
                  t('templates.minimal'),
                ].map((tmplName, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    disabled
                    variant="outline"
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                      idx === 0
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground'
                    }`}
                  >
                    {tmplName}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Theme Selector Skeleton */}
            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                {t('colorTheme')}
              </label>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>

            {/* Target Generation Languages Grid */}
            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-32 rounded-sm" />
                <Skeleton className="h-3.5 w-16 rounded-sm" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
                <Skeleton className="h-8 rounded-xl" />
              </div>
            </div>

            {/* Regenerate AI Button */}
            <Button
              disabled
              className="w-full py-6 rounded-xl shadow-md gap-2 mt-2 bg-primary/80"
            >
              <RefreshCw className="h-4 w-4 opacity-70" />
              <span>{t('regenerate')}</span>
            </Button>
          </div>
        </div>

        {/* Right Column (8 cols): Tabs & CV Document Skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Real Tab Switcher Buttons (Disabled / Loading) */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2 border-b pb-2">
            <div className="flex gap-2 bg-muted/60 p-1 rounded-xl border border-border/60">
              <Button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-background text-foreground shadow-xs border-0"
              >
                <FileText className="h-3.5 w-3.5" />
                {t('tabs.cvPreview')}
              </Button>
              <Button
                disabled
                variant="ghost"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border-0"
              >
                <Briefcase className="h-3.5 w-3.5" />
                {t('tabs.jobDesc')}
              </Button>
              <Button
                disabled
                variant="ghost"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t('tabs.atsAnalysis')}
              </Button>
              <Button
                disabled
                variant="ghost"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border-0"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500/70" />
                {t('tabs.coverLetter')}
              </Button>
              <Button
                disabled
                variant="ghost"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border-0"
              >
                <Send className="h-3.5 w-3.5 text-blue-500/70" />
                {t('tabs.coldMessage')}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <span>{t('activeVersion')}:</span>
              <Skeleton className="h-4 w-6 rounded-sm" />
            </div>
          </div>

          {/* CV Document Container Skeleton */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg flex flex-col gap-6 min-h-[750px]">
            {/* Header: Photo & Name / Contact info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-52 rounded-md" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
              </div>
              <div className="space-y-1.5 text-right w-full sm:w-auto">
                <Skeleton className="h-3.5 w-40 rounded-md ml-auto" />
                <Skeleton className="h-3.5 w-32 rounded-md ml-auto" />
                <Skeleton className="h-3.5 w-28 rounded-md ml-auto" />
              </div>
            </div>

            {/* Section 1: SUMMARY */}
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-24 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-[94%] rounded-md" />
                <Skeleton className="h-3.5 w-[80%] rounded-md" />
              </div>
            </div>

            {/* Section 2: WORK EXPERIENCE */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-36 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-[90%] rounded-md" />
              </div>
            </div>

            {/* Section 3: EDUCATION */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-28 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3.5 w-1/2 rounded-md" />
              </div>
            </div>

            {/* Section 4: SKILLS */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-20 rounded-md uppercase" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-[88%] rounded-md" />
                <Skeleton className="h-3.5 w-[75%] rounded-md" />
              </div>
            </div>

            {/* Section 5: LANGUAGES */}
            <div className="space-y-2.5 pt-2">
              <Skeleton className="h-4 w-24 rounded-md uppercase" />
              <Skeleton className="h-3.5 w-48 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
