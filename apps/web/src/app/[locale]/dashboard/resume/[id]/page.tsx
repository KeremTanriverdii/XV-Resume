'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  fetchResumeById,
  generateResume,
  deleteResume,
  updateResumeTranslation,
} from '@/services/resumeService';
import { useQueryClient } from '@tanstack/react-query';
import { useResumeSession, resumeKeys } from '@/hooks/useResume';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeDto, ResumeTranslationDto } from '@/types';
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  Globe,
  Layers,
  ExternalLink,
  Calendar,
  Sparkles,
  FileText,
  Briefcase,
  CheckCircle2,
  Download,
  Layout,
  Palette,
  Trash2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import {
  ResumeTemplates,
  TemplateId,
  ColorThemeId,
  COLOR_THEMES,
} from '@/components/resume/ResumeTemplates';
import { exportToPdf } from '@/utils/pdfExport';
import { AtsMatcherTab } from '@/components/resume/AtsMatcherTab';
import { CoverLetterTab } from '@/components/resume/CoverLetterTab';
import { ColdMessageTab } from '@/components/resume/ColdMessageTab';
import { LanguageGenerationSelector } from '@/components/resume/LanguageGenerationSelector';
import { ProtectedPreviewOverlay } from '@/components/resume/ProtectedPreviewOverlay';
import { SessionDetailSkeleton } from '@/components/resume/SessionDetailSkeleton';
import { AuthModal } from '@/components/auth/AuthModal';
import { AiRegeneratingOverlay } from '@/components/resume/AiRegeneratingOverlay';
import { Mail, Send } from 'lucide-react';

const parseBold = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong
        key={index}
        className="font-semibold text-zinc-900 dark:text-white"
      >
        {part}
      </strong>
    ) : (
      part
    ),
  );
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const sections = text.split(/\n\n+/);
  return sections.map((sec, sIdx) => {
    if (sec.trim().startsWith('#')) {
      const level = (sec.match(/^#+/) || ['###'])[0].length;
      const cleanText = sec.replace(/^#+\s*/, '');
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      const headingClass =
        level === 1
          ? 'text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-3 first:mt-0'
          : level === 2
            ? 'text-md font-bold text-zinc-800 dark:text-zinc-200 mt-5 mb-2 first:mt-0'
            : 'text-sm font-bold text-zinc-850 dark:text-zinc-300 mt-4 mb-2 first:mt-0';
      return (
        <Tag key={sIdx} className={headingClass}>
          {parseBold(cleanText)}
        </Tag>
      );
    }
    if (sec.trim().startsWith('-') || sec.trim().startsWith('*')) {
      const items = sec
        .split(/\n[-*]\s+/)
        .map((item) => item.replace(/^[-*]\s*/, ''));
      return (
        <ul key={sIdx} className="list-disc pl-5 my-3 space-y-1.5">
          {items.map((item, iIdx) => (
            <li key={iIdx} className="text-sm text-zinc-650 dark:text-zinc-300">
              {parseBold(item)}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p
        key={sIdx}
        className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed mb-3 last:mb-0"
      >
        {parseBold(sec)}
      </p>
    );
  });
};

const cleanJobDescriptionText = (raw?: string | null) => {
  if (!raw) return 'No job description text available.';

  let text = raw;

  // Remove scripts, styles and JS functions
  text = text.replace(/<script[^>]*?>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[^>]*?>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/function\s+\w+[\s\S]*?\{[\s\S]*?\}/gi, ' ');
  text = text.replace(/window\.\w+\s*=\s*[^;]+;/gi, ' ');

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Remove web UI / tracking noise
  const noise = [
    /Skip to main content/gi,
    /Expand search/gi,
    /This Button displays the currently selected search type[^\.\n]*/gi,
    /When expanded it provides a list of search options[^\.\n]*/gi,
    /Clear text/gi,
    /Sign in/gi,
    /Join now/gi,
    /Primary Nav/gi,
    /babymamabear:[^\s]+/gi,
    /papabear:[^\s]+/gi,
    /babybear:[^\s]+/gi,
    /mamabear:[^\s]+/gi,
  ];
  noise.forEach((re) => {
    text = text.replace(re, ' ');
  });

  // Decode HTML entities & strip extra spaces
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  const lines = text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(
      (l) =>
        l.length > 2 &&
        !l.includes('getDfd') &&
        !l.includes('lazyloader') &&
        !l.includes('ingraphTracking'),
    );

  const clean = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return clean.length > 0 ? clean : raw;
};

import { formatCompanyAndRole } from '@/utils/formatTitle';
import { Button } from '@/components/ui/button';

export default function ResumeSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const locale = useLocale();

  const queryClient = useQueryClient();

  const t = useTranslations('resume');
  const tToast = useTranslations('toast');
  const { session, isLoading: isAuthLoading } = useAuth();
  const token = session?.access_token;
  const router = useRouter();

  const updateSessionTitle = useResumeStore(
    (state) => state.updateSessionTitle,
  );

  // Initial params
  const initialTemplate =
    (searchParams?.get('template') as TemplateId) || 'modern';
  const initialColor = (searchParams?.get('color') as ColorThemeId) || 'blue';

  // State
  const [regenerating, setRegenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(locale);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>(initialTemplate);
  const [selectedColor, setSelectedColor] =
    useState<ColorThemeId>(initialColor);
  const [selectedRegenLangs, setSelectedRegenLangs] = useState<string[]>([
    'en',
    'tr',
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'preview' | 'builder' | 'jobDesc' | 'ats' | 'coverLetter' | 'coldMessage'
  >('preview');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authActionTitle, setAuthActionTitle] = useState<string>(
    t('authModal.saveExportTitle'),
  );
  const [pendingAction, setPendingAction] = useState<
    'download' | 'email' | 'save' | 'ats' | null
  >(null);

  const handleActionTrigger = (action: 'download' | 'email' | 'save') => {
    if (!session) {
      setPendingAction(action);
      setAuthActionTitle(
        action === 'download'
          ? t('authModal.downloadTitle')
          : action === 'email'
            ? t('authModal.emailTitle')
            : t('authModal.saveTitle'),
      );
      setIsAuthModalOpen(true);
      return;
    }

    if (action === 'download') {
      handleDownloadPdf();
    }
  };

  const handleRequestAtsLogin = () => {
    setPendingAction('ats');
    setAuthActionTitle(t('authModal.atsTitle'));
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction === 'download') {
      setTimeout(() => handleDownloadPdf(), 500);
    } else if (pendingAction === 'ats') {
      setActiveTab('ats');
    }
    setPendingAction(null);
  };

  // TanStack Query Session Detail Cache Hook
  const {
    data: fetchedResume,
    isLoading: isSessionLoading,
    isFetching,
    isPending,
    refetch: refetchSession,
  } = useResumeSession(id, token);

  const resume = fetchedResume;

  // Sync title and selected language/version when fetchedResume changes
  useEffect(() => {
    if (fetchedResume) {
      const activeT =
        fetchedResume.translations.find(
          (t) => t.languageCode === selectedLang,
        ) || fetchedResume.translations[0];
      const formattedTitle = formatCompanyAndRole(
        activeT?.title,
        fetchedResume.externalJobLink,
      );
      updateSessionTitle(fetchedResume.id, formattedTitle);

      const langs = Array.from(
        new Set(fetchedResume.translations.map((t) => t.languageCode)),
      );
      const versions = Array.from(
        new Set(fetchedResume.translations.map((t) => t.version)),
      );

      if (langs.length > 0 && !langs.includes(selectedLang)) {
        setSelectedLang(langs[0]);
      }

      if (versions.length > 0 && !versions.includes(selectedVersion)) {
        setSelectedVersion(versions[0]);
      }
    }
  }, [fetchedResume, selectedLang, selectedVersion, updateSessionTitle]);

  // Handle CV Regeneration (New Version)
  const handleRegenerate = async () => {
    if (!resume || !token) return;
    setRegenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await generateResume(
        {
          resumeId: resume.id,
          externalJobLink: resume.externalJobLink,
          profileId: resume.profileId,
          selectedLanguagesForGeneration: selectedRegenLangs,
        },
        token,
      );

      if (result) {
        setSuccessMsg(t('regenerateSuccess'));
        const { data: updated } = await refetchSession();
        if (updated) {
          const versions = Array.from(
            new Set(updated.translations.map((t) => t.version)),
          );
          if (versions.length > 0) {
            setSelectedVersion(Math.max(...versions));
          }
        }
      } else {
        setErrorMsg(t('regenerateError'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t('regenerateError'));
    } finally {
      setRegenerating(false);
    }
  };

  const removeSession = useResumeStore((state) => state.removeSession);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveTranslation = async () => {
    if (!resume || !activeTranslation || isSaving) return;
    setIsSaving(true);
    try {
      const ok = await updateResumeTranslation(
        resume.id,
        activeTranslation.id,
        {
          title: activeTranslation.title,
          summary: activeTranslation.summary,
          experienceHtml: activeTranslation.experienceHtml,
          educationHtml: activeTranslation.educationHtml,
          skillsHtml: activeTranslation.skillsHtml,
          languagesHtml: activeTranslation.languagesHtml,
          projectsHtml: activeTranslation.projectsHtml,
        },
        token,
      );
      if (ok) {
        setSaveSuccess(true);
        toast.success(tToast('savedSuccess'));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error(tToast('saveError'));
      }
    } catch (err) {
      console.error('Save translation error:', err);
      toast.error(tToast('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!resume || isDeleting) return;
    if (!window.confirm(t('deleteConfirm'))) return;

    setIsDeleting(true);
    try {
      if (token) {
        await deleteResume(resume.id, token);
      }
      removeSession(resume.id);
      toast.success(tToast('deleteSuccess'));
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to delete resume:', err);
      toast.error(tToast('deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const profileName =
        resume?.profile?.fullName || activeTranslation?.title || 'Resume';
      const cleanName = profileName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_${selectedLang}_v${selectedVersion}_${selectedTemplate}`;
      await exportToPdf({ elementId: 'cv-document-container', filename });
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (
    isAuthLoading ||
    (isSessionLoading && !resume) ||
    (isPending && isFetching && !resume)
  ) {
    return <SessionDetailSkeleton />;
  }

  if (!resume) {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
          ⚠️
        </div>
        <h2 className="text-xl font-bold">{t('sessionNotFoundTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('sessionNotFoundDesc')}
        </p>
        <Button asChild className="rounded-full mt-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToDashboard')}
          </Link>
        </Button>
      </div>
    );
  }

  // Get available options from translations
  const availableLangs = Array.from(
    new Set(resume.translations.map((t) => t.languageCode)),
  );
  const availableVersions = Array.from(
    new Set(
      resume.translations
        .filter((t) => t.languageCode === selectedLang)
        .map((t) => t.version),
    ),
  ).sort((a, b) => b - a); // Sort descending (v2, v1)

  // Find currently active translation
  const activeTranslation =
    resume.translations.find(
      (t) => t.languageCode === selectedLang && t.version === selectedVersion,
    ) || resume.translations.find((t) => t.languageCode === selectedLang); // Fallback to same language

  return (
    <div className="flex flex-col gap-6 p-1 max-w-7xl mx-auto w-full">
      <AiRegeneratingOverlay isOpen={regenerating} colorTheme={selectedColor} />
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary shrink-0" />
              {formatCompanyAndRole(
                activeTranslation?.title,
                resume.externalJobLink,
              )}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {t('createdAt')}:{' '}
                {new Date(resume.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Quick actions: Job link & PDF Download */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {resume.externalJobLink && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full gap-1.5 cursor-pointer"
            >
              <a
                href={resume.externalJobLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t('jobLink')}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}

          {activeTranslation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveTranslation}
              disabled={isSaving}
              className="rounded-full gap-1.5 cursor-pointer shadow-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t('saving')}</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t('saved')}</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{t('save')}</span>
                </>
              )}
            </Button>
          )}

          <Button
            onClick={handleDownloadPdf}
            disabled={
              downloadingPdf || activeTab !== 'preview' || !activeTranslation
            }
            className="rounded-full gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer bg-primary text-primary-foreground"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('downloadingPdf')}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{t('downloadPdf')}</span>
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteResume}
            disabled={isDeleting}
            className="rounded-full gap-1.5 cursor-pointer shadow-sm"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
                <span className="text-black dark:text-white">
                  {t('delete')}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-2xl">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-2xl">
          {successMsg}
        </div>
      )}

      {/* Main Grid: Settings & CV Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (left) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {t('aiSessionOptions')}
            </h3>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {t('language')}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => {
                  const lang = e.target.value;
                  setSelectedLang(lang);
                  const relatedVers = resume.translations
                    .filter((t) => t.languageCode === lang)
                    .map((t) => t.version);
                  if (relatedVers.length > 0) {
                    setSelectedVersion(Math.max(...relatedVers));
                  }
                }}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary/20 outline-hidden cursor-pointer"
              >
                {availableLangs.map((langCode) => (
                  <option key={langCode} value={langCode}>
                    {langCode.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Version Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                {t('version')}
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary/20 outline-hidden cursor-pointer"
              >
                {availableVersions.map((v) => (
                  <option key={v} value={v}>
                    v{v}{' '}
                    {v === Math.max(...availableVersions) ? '(Latest)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-primary" />
                {t('template')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'modern', name: t('templates.modern') },
                  { id: 'executive', name: t('templates.executive') },
                  { id: 'sidebar', name: t('templates.sidebar') },
                  { id: 'minimal', name: t('templates.minimal') },
                ].map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id as TemplateId)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedTemplate === tmpl.id
                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                        : 'border-border/60 hover:bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    {tmpl.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                {t('colorTheme')}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(Object.keys(COLOR_THEMES) as ColorThemeId[]).map((cId) => (
                  <Button
                    key={cId}
                    type="button"
                    onClick={() => setSelectedColor(cId)}
                    className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                      selectedColor === cId
                        ? 'border-primary scale-110 shadow-xs'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: COLOR_THEMES[cId].hex }}
                  />
                ))}
              </div>
            </div>

            {/* Regenerate Target Languages Selector */}
            <div className="space-y-1.5 border-t border-border/60 pt-4">
              <LanguageGenerationSelector
                selectedLanguages={selectedRegenLangs}
                onChange={setSelectedRegenLangs}
                disabled={regenerating}
              />
            </div>

            {/* Regenerate Action */}
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="w-full py-6 rounded-xl shadow-md gap-2 mt-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all dark:bg-blue-500 dark:border-white"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('regenerating')}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{t('regenerate')}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CV Document Preview Column (right) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-2 border-b pb-2">
            <div className="flex gap-2 bg-muted/60 p-1 rounded-xl border border-border/60">
              <Button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer hover:bg-zinc-300/50 border-0 dark:hover:bg-zinc-500/50 ${
                  activeTab === 'preview'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                {t('tabs.cvPreview')}
              </Button>
              <Button
                onClick={() => setActiveTab('jobDesc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer hover:bg-zinc-300/50 border-0 dark:hover:bg-zinc-500/50 ${
                  activeTab === 'jobDesc'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                {t('tabs.jobDesc')}
              </Button>
              <Button
                onClick={() => setActiveTab('ats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer  hover:bg-zinc-300/50 border-0 dark:hover:bg-zinc-500/50 ${
                  activeTab === 'ats'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t('tabs.atsAnalysis')}
              </Button>
              <Button
                onClick={() => setActiveTab('coverLetter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer  hover:bg-zinc-300/50 border-0 dark:hover:bg-zinc-500/50 ${
                  activeTab === 'coverLetter'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Mail className="h-3.5 w-3.5 text-emerald-500" />
                {t('tabs.coverLetter')}
              </Button>
              <Button
                onClick={() => setActiveTab('coldMessage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer  hover:bg-zinc-300/50 border-0 dark:hover:bg-zinc-500/50 ${
                  activeTab === 'coldMessage'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Send className="h-3.5 w-3.5 text-blue-500" />
                {t('tabs.coldMessage')}
              </Button>
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              {t('activeVersion')}:{' '}
              <span className="font-semibold text-foreground">
                v{selectedVersion}
              </span>
            </span>
          </div>

          {activeTranslation ? (
            <>
              {activeTab === 'preview' && (
                <ProtectedPreviewOverlay
                  isAuthenticated={!!session}
                  onActionTrigger={handleActionTrigger}
                >
                  <ResumeTemplates
                    resume={resume}
                    translation={activeTranslation}
                    templateId={selectedTemplate}
                    colorThemeId={selectedColor}
                    tLabels={{
                      summary: t('summary'),
                      experience: t('experience'),
                      education: t('education'),
                      skills: t('skills'),
                      projects: t('projects'),
                      languages: t('languages'),
                      military: t('military'),
                      militaryStatus: t.raw('militaryStatus') as Record<
                        string,
                        string
                      >,
                    }}
                  />
                </ProtectedPreviewOverlay>
              )}

              {activeTab === 'jobDesc' && (
                <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[800px] flex flex-col gap-6 transition-colors duration-300">
                  <div className="border-b-2 border-primary/20 pb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        {t('jobDescTitle')}
                      </h2>
                      {resume.externalJobLink && (
                        <a
                          href={resume.externalJobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-semibold mt-1 flex items-center gap-1"
                        >
                          <span>{t('goToJobPosting')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed tracking-normal font-sans bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-xl border border-border/50">
                    {cleanJobDescriptionText(resume.jobDescription)}
                  </div>
                </div>
              )}

              {activeTab === 'ats' && (
                <AtsMatcherTab
                  resume={resume}
                  translation={activeTranslation}
                  isAuthenticated={!!session}
                  onRequestLogin={handleRequestAtsLogin}
                  onApplyTailoredTranslation={(updatedTranslation) => {
                    if (!resume || !activeTranslation) return;
                    const updatedTranslations = resume.translations.map((tr) =>
                      tr.id === activeTranslation.id
                        ? { ...tr, ...updatedTranslation }
                        : tr,
                    );
                    queryClient.setQueryData(resumeKeys.detail(resume.id), {
                      ...resume,
                      translations: updatedTranslations,
                    } as ResumeDto);
                  }}
                />
              )}

              {activeTab === 'coverLetter' && (
                <CoverLetterTab
                  key={`coverletter-${activeTranslation.id}-${activeTranslation.languageCode}`}
                  translation={activeTranslation}
                  profile={resume?.profile}
                  onSaveTranslation={async (updated) => {
                    if (!resume || !token || !activeTranslation.id)
                      return false;
                    try {
                      setIsSaving(true);
                      const ok = await updateResumeTranslation(
                        resume.id,
                        activeTranslation.id,
                        updated,
                        token,
                      );
                      if (ok) {
                        const updatedTranslations = resume.translations.map(
                          (tr) =>
                            tr.id === activeTranslation.id
                              ? { ...tr, ...updated }
                              : tr,
                        );
                        queryClient.setQueryData(resumeKeys.detail(resume.id), {
                          ...resume,
                          translations: updatedTranslations,
                        } as ResumeDto);
                        return true;
                      }
                      return false;
                    } catch {
                      return false;
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  isSaving={isSaving}
                />
              )}

              {activeTab === 'coldMessage' && (
                <ColdMessageTab
                  key={`coldmessage-${activeTranslation.id}-${activeTranslation.languageCode}`}
                  translation={activeTranslation}
                  profile={resume?.profile}
                  onSaveTranslation={async (updated) => {
                    if (!resume || !token || !activeTranslation.id)
                      return false;
                    try {
                      setIsSaving(true);
                      const ok = await updateResumeTranslation(
                        resume.id,
                        activeTranslation.id,
                        updated,
                        token,
                      );
                      if (ok) {
                        const updatedTranslations = resume.translations.map(
                          (tr) =>
                            tr.id === activeTranslation.id
                              ? { ...tr, ...updated }
                              : tr,
                        );
                        queryClient.setQueryData(resumeKeys.detail(resume.id), {
                          ...resume,
                          translations: updatedTranslations,
                        } as ResumeDto);
                        return true;
                      }
                      return false;
                    } catch {
                      return false;
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  isSaving={isSaving}
                />
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Auth Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        title={authActionTitle}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
