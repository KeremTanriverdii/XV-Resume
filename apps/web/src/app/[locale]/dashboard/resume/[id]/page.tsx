"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { fetchResumeById, generateResume } from "@/services/resumeService";
import { ResumeDto, ResumeTranslationDto } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ArrowLeft, 
  RefreshCw, 
  Globe, 
  Layers, 
  ExternalLink, 
  Calendar,
  Sparkles,
  FileText
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ResumeSessionPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const t = useTranslations("resume");
  const { session } = useAuth();
  const token = session?.access_token;
  const router = useRouter();

  // State
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Resume details
  const loadResumeData = async (selectLatest = false) => {
    if (!id || !token) return;
    try {
      const data = await fetchResumeById(id, token);
      if (data) {
        setResume(data);
        
        // Find all available languages and versions
        const langs = Array.from(new Set(data.translations.map(t => t.languageCode)));
        const versions = Array.from(new Set(data.translations.map(t => t.version)));
        
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
        setErrorMsg("Resume not found");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load resume details");
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
      const result = await generateResume({
        resumeId: resume.id,
        externalJobLink: resume.externalJobLink,
        profileId: resume.profileId,
        selectedLanguagesForGeneration: [selectedLang]
      }, token);

      if (result) {
        setSuccessMsg(t("regenerateSuccess"));
        // Reload and force selecting the newly generated version
        await loadResumeData(true);
      } else {
        setErrorMsg(t("regenerateError"));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t("regenerateError"));
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading AI Resume Session...</p>
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
        <p className="text-sm text-muted-foreground">The requested AI CV generation session could not be retrieved.</p>
        <Button asChild className="rounded-full mt-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("backToDashboard")}
          </Link>
        </Button>
      </div>
    );
  }

  // Get available options from translations
  const availableLangs = Array.from(new Set(resume.translations.map(t => t.languageCode)));
  const availableVersions = Array.from(new Set(
    resume.translations
      .filter(t => t.languageCode === selectedLang)
      .map(t => t.version)
  )).sort((a, b) => b - a); // Sort descending (v2, v1)

  // Find currently active translation
  const activeTranslation = resume.translations.find(
    t => t.languageCode === selectedLang && t.version === selectedVersion
  ) || resume.translations.find(t => t.languageCode === selectedLang); // Fallback to same language

  return (
    <div className="flex flex-col gap-6 p-1 max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9 shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary shrink-0" />
              {activeTranslation?.title || "AI Generated Resume"}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{t("createdAt")}: {new Date(resume.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Quick actions or info */}
        <div className="flex items-center gap-2 shrink-0">
          {resume.externalJobLink && (
            <Button variant="outline" size="sm" asChild className="rounded-full gap-1.5 cursor-pointer">
              <a href={resume.externalJobLink} target="_blank" rel="noopener noreferrer">
                <span>{t("jobLink")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
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
                {t("language")}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => {
                  const lang = e.target.value;
                  setSelectedLang(lang);
                  // Update version selection if needed
                  const relatedVers = resume.translations.filter(t => t.languageCode === lang).map(t => t.version);
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
                {t("version")}
              </label>
              <select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(Number(e.target.value))}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm shadow-xs focus:ring-2 focus:ring-primary/20 outline-hidden cursor-pointer"
              >
                {availableVersions.map((v) => (
                  <option key={v} value={v}>
                    v{v} {v === Math.max(...availableVersions) ? "(Latest)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Regenerate Action */}
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="w-full py-6 rounded-xl shadow-md gap-2 mt-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("regenerating")}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{t("regenerate")}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CV Document Preview Column (right) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("preview")}
            </span>
            <span className="text-xs text-muted-foreground">
              Active Version: <span className="font-semibold text-foreground">v{selectedVersion}</span>
            </span>
          </div>

          {activeTranslation ? (
            <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[800px] flex flex-col gap-8 transition-colors duration-300">
              
              {/* Document Header */}
              <div className="border-b-2 border-primary/20 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
                    {resume.profile?.fullName || activeTranslation.title.split("-")[0].trim()}
                  </h2>
                  <p className="text-md font-medium text-primary mt-2 uppercase tracking-wide">
                    {resume.profile?.title || "Professional Applicant"}
                  </p>
                </div>

                <div className="flex flex-col text-xs text-zinc-500 dark:text-zinc-400 gap-1 sm:text-right font-medium shrink-0">
                  {resume.profile?.email && <span>{resume.profile.email}</span>}
                  {resume.profile?.phone && <span>{resume.profile.phone}</span>}
                  {resume.profile?.location && <span>{resume.profile.location}</span>}
                </div>
              </div>

              {/* Summary Section */}
              {activeTranslation.summary && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    {t("summary")}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                    {activeTranslation.summary}
                  </p>
                </div>
              )}

              {/* Experience HTML */}
              {activeTranslation.experienceHtml && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    {t("experience")}
                  </h3>
                  <div 
                    className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:text-zinc-800 dark:prose-headings:text-zinc-200 prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-ul:list-disc prose-ul:pl-5"
                    dangerouslySetInnerHTML={{ __html: activeTranslation.experienceHtml }}
                  />
                </div>
              )}

              {/* Education HTML */}
              {activeTranslation.educationHtml && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    {t("education")}
                  </h3>
                  <div 
                    className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:text-zinc-800 dark:prose-headings:text-zinc-200 prose-p:text-zinc-600 dark:prose-p:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: activeTranslation.educationHtml }}
                  />
                </div>
              )}

              {/* Skills HTML */}
              {activeTranslation.skillsHtml && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    {t("skills")}
                  </h3>
                  <div 
                    className="prose prose-zinc dark:prose-invert prose-sm max-w-none prose-headings:text-zinc-800 dark:prose-headings:text-zinc-200 prose-p:text-zinc-600 dark:prose-p:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: activeTranslation.skillsHtml }}
                  />
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <span className="text-2xl">📭</span>
              <p className="text-sm font-medium">{t("noTranslation")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
