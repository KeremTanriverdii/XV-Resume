'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { fetchResumeById, generateResume } from '@/services/resumeService';
import { ResumeDto, ResumeTranslationDto } from '@/types';
import { Button } from '@/components/ui/button';
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
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  Layout,
  Palette,
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  ResumeTemplates,
  TemplateId,
  ColorThemeId,
  COLOR_THEMES,
} from '@/components/resume/ResumeTemplates';
import { exportToPdf } from '@/utils/pdfExport';

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
    /This button displays the currently selected search type[^\.\n]*/gi,
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

import { useResumeStore } from '@/store/useResumeStore';
import { formatCompanyAndRole } from '@/utils/formatTitle';

export default function ResumeSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const t = useTranslations('resume');
  const { session } = useAuth();
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
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>(initialTemplate);
  const [selectedColor, setSelectedColor] =
    useState<ColorThemeId>(initialColor);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'jobDesc' | 'ats'>(
    'preview',
  );

  // Fetch Resume details
  const loadResumeData = async (selectLatest = false) => {
    if (!id || !token) return;
    try {
      const data = await fetchResumeById(id, token);
      if (data) {
        setResume(data);
        const activeT =
          data.translations.find((t) => t.languageCode === selectedLang) ||
          data.translations[0];
        const formattedTitle = formatCompanyAndRole(
          activeT?.title,
          data.externalJobLink,
        );
        updateSessionTitle(data.id, formattedTitle);

        // Find all available languages and versions
        const langs = Array.from(
          new Set(data.translations.map((t) => t.languageCode)),
        );
        const versions = Array.from(
          new Set(data.translations.map((t) => t.version)),
        );

        // Default language selection to first available or fallback to current
        if (langs.length > 0 && !langs.includes(selectedLang)) {
          setSelectedLang(langs[0]);
        }

        // Default version selection
        if (selectLatest && versions.length > 0) {
          const maxVer = Math.max(...versions);
          setSelectedVersion(maxVer);
        } else if (versions.length > 0 && !versions.includes(selectedVersion)) {
          setSelectedVersion(versions[0]);
        }
      } else {
        setErrorMsg('Resume not found');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load resume details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      loadResumeData();
    }
  }, [token, id]);

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
          selectedLanguagesForGeneration: [selectedLang],
        },
        token,
      );

      if (result) {
        setSuccessMsg(t('regenerateSuccess'));
        // Reload and force selecting the newly generated version
        await loadResumeData(true);
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

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading AI Resume Session...
        </p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-2">
          ⚠️
        </div>
        <h2 className="text-xl font-bold">Resume Session Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested AI CV generation session could not be retrieved.
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
              AI Session Options
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
                  { id: 'modern', name: 'Modern' },
                  { id: 'executive', name: 'Executive' },
                  { id: 'sidebar', name: 'Left Sidebar' },
                  { id: 'minimal', name: 'Minimalist' },
                ].map((tmpl) => (
                  <button
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
                  </button>
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
                  <button
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
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Tailored CV
              </button>
              <button
                onClick={() => setActiveTab('jobDesc')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === 'jobDesc'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Job Description
              </button>
              <button
                onClick={() => setActiveTab('ats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === 'ats'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                ATS Analysis
                {activeTranslation?.matchPercentage !== undefined &&
                  activeTranslation?.matchPercentage !== null && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold leading-none ${
                        activeTranslation.matchPercentage >= 80
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : activeTranslation.matchPercentage >= 50
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {activeTranslation.matchPercentage}%
                    </span>
                  )}
              </button>
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              Active Version:{' '}
              <span className="font-semibold text-foreground">
                v{selectedVersion}
              </span>
            </span>
          </div>

          {activeTranslation ? (
            <>
              {activeTab === 'preview' && (
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
              )}

              {activeTab === 'jobDesc' && (
                <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[800px] flex flex-col gap-6 transition-colors duration-300">
                  <div className="border-b-2 border-primary/20 pb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Job Advertisement / İş İlanı Detayları
                      </h2>
                      {resume.externalJobLink && (
                        <a
                          href={resume.externalJobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-semibold mt-1 flex items-center gap-1"
                        >
                          <span>Go to Job Posting</span>
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
                <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[800px] flex flex-col gap-8 transition-colors duration-300">
                  <div className="border-b-2 border-primary/20 pb-4">
                    <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                      ATS Match & Compatibility Analysis
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      AI-driven evaluation comparing your CV achievements with
                      the job posting requirements.
                    </p>
                  </div>

                  {/* Match Score Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-zinc-50 dark:bg-zinc-900/20 p-6 rounded-2xl border border-border/50">
                    <div className="flex flex-col items-center justify-center text-center p-4 bg-background rounded-xl shadow-xs border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        ATS Score
                      </span>
                      <div className="relative flex items-center justify-center mt-3 mb-1">
                        {activeTranslation.matchPercentage !== undefined &&
                        activeTranslation.matchPercentage !== null ? (
                          <>
                            <svg className="w-24 h-24 transform -rotate-90">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-zinc-200 dark:text-zinc-800"
                                fill="transparent"
                              />
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                className={
                                  activeTranslation.matchPercentage >= 80
                                    ? 'text-emerald-500'
                                    : activeTranslation.matchPercentage >= 50
                                      ? 'text-amber-500'
                                      : 'text-destructive'
                                }
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={
                                  2 *
                                  Math.PI *
                                  40 *
                                  (1 - activeTranslation.matchPercentage / 100)
                                }
                                strokeLinecap="round"
                                fill="transparent"
                              />
                            </svg>
                            <span className="absolute text-2xl font-black">
                              {activeTranslation.matchPercentage}%
                            </span>
                          </>
                        ) : (
                          <div className="h-24 w-24 flex items-center justify-center rounded-full border-4 border-dashed text-sm font-semibold text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-semibold text-sm sm:text-md text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-primary animate-pulse" />
                        Compatibility Rating:{' '}
                        {activeTranslation.matchPercentage === undefined ||
                        activeTranslation.matchPercentage === null
                          ? 'Pending'
                          : activeTranslation.matchPercentage >= 85
                            ? 'Excellent Match / Harika Uyum'
                            : activeTranslation.matchPercentage >= 70
                              ? 'Very Good Match / Çok İyi Uyum'
                              : activeTranslation.matchPercentage >= 50
                                ? 'Good Match / İyi Uyum'
                                : 'Needs Refinement / Geliştirilmeli'}
                      </h3>
                      <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed">
                        This AI assessment evaluates keyword density (core
                        technologies, methodologies), experience relevance
                        matching, and structural ATS compliance of the tailored
                        resume relative to the parsed requirements.
                      </p>
                    </div>
                  </div>

                  {/* Feedback Critique */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary border-b border-zinc-200 dark:border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Critical Point Identifications & Optimization Details
                    </h3>
                    <div className="bg-zinc-55 dark:bg-zinc-900/10 border rounded-xl p-5 shadow-xs">
                      {activeTranslation.atsFeedback ? (
                        <div className="space-y-3">
                          {renderMarkdown(activeTranslation.atsFeedback)}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          No feedback is available for this version. Please
                          regenerate the CV to generate ATS feedback.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <span className="text-2xl">📭</span>
              <p className="text-sm font-medium">{t('noTranslation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
