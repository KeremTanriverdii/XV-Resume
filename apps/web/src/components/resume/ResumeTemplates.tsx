"use client";

import React from "react";
import { ResumeDto, ResumeTranslationDto } from "@/types";

export type TemplateId = "modern" | "executive" | "sidebar" | "minimal";
export type ColorThemeId = "blue" | "emerald" | "indigo" | "purple" | "slate";

export interface ColorTheme {
  id: ColorThemeId;
  name: string;
  primaryClass: string;
  borderClass: string;
  bgLightClass: string;
  badgeClass: string;
  textClass: string;
  hex: string;
}

export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  blue: {
    id: "blue",
    name: "Sapphire Blue",
    primaryClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-600 dark:border-blue-500",
    bgLightClass: "bg-blue-50 dark:bg-blue-950/30",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    textClass: "text-blue-700 dark:text-blue-300",
    hex: "#2563eb",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Green",
    primaryClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-600 dark:border-emerald-500",
    bgLightClass: "bg-emerald-50 dark:bg-emerald-950/30",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    textClass: "text-emerald-700 dark:text-emerald-300",
    hex: "#059669",
  },
  indigo: {
    id: "indigo",
    name: "Indigo Violet",
    primaryClass: "text-indigo-600 dark:text-indigo-400",
    borderClass: "border-indigo-600 dark:border-indigo-500",
    bgLightClass: "bg-indigo-50 dark:bg-indigo-950/30",
    badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    textClass: "text-indigo-700 dark:text-indigo-300",
    hex: "#4f46e5",
  },
  purple: {
    id: "purple",
    name: "Deep Purple",
    primaryClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-600 dark:border-purple-500",
    bgLightClass: "bg-purple-50 dark:bg-purple-950/30",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    textClass: "text-purple-700 dark:text-purple-300",
    hex: "#7c3aed",
  },
  slate: {
    id: "slate",
    name: "Dark Slate",
    primaryClass: "text-zinc-800 dark:text-zinc-200",
    borderClass: "border-zinc-800 dark:border-zinc-400",
    bgLightClass: "bg-zinc-100 dark:bg-zinc-900",
    badgeClass: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    textClass: "text-zinc-800 dark:text-zinc-200",
    hex: "#3f3f46",
  },
};

export const SECTION_LABELS_BY_LANG: Record<
  string,
  {
    summary: string;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    languages: string;
    military: string;
    contact: string;
    militaryStatus: Record<string, string>;
  }
> = {
  en: {
    summary: "SUMMARY",
    experience: "WORK EXPERIENCE",
    education: "EDUCATION",
    skills: "SKILLS",
    projects: "PROJECTS",
    languages: "LANGUAGES",
    military: "MILITARY SERVICE",
    contact: "CONTACT",
    militaryStatus: {
      Completed: "Completed",
      Postponed: "Postponed",
      Exempt: "Exempt",
      None: "None",
    },
  },
  tr: {
    summary: "ÖZET",
    experience: "İŞ DENEYİMİ",
    education: "EĞİTİM",
    skills: "YETENEKLER",
    projects: "PROJELER",
    languages: "YABANCI DİLLER",
    military: "ASKERLİK DURUMU",
    contact: "İLETİŞİM",
    militaryStatus: {
      Completed: "Yapıldı",
      Postponed: "Tecilli",
      Exempt: "Muaf",
      None: "Yok",
    },
  },
  de: {
    summary: "ZUSAMMENFASSUNG",
    experience: "BERUFSERFAHRUNG",
    education: "AUSBILDUNG",
    skills: "KENNTNISSE",
    projects: "PROJEKTE",
    languages: "SPRACHEN",
    military: "WEHRDIENST",
    contact: "KONTAKT",
    militaryStatus: {
      Completed: "Abgeleistet",
      Postponed: "Zurückgestellt",
      Exempt: "Befreit",
      None: "Keiner",
    },
  },
  fr: {
    summary: "RÉSUMÉ",
    experience: "EXPÉRIENCE PROFESSIONNELLE",
    education: "ÉDUCATION",
    skills: "COMPÉTENCES",
    projects: "PROJETS",
    languages: "LANGUES",
    military: "SERVICE MILITAIRE",
    contact: "CONTACT",
    militaryStatus: {
      Completed: "Effectué",
      Postponed: "Reporté",
      Exempt: "Exempté",
      None: "Aucun",
    },
  },
  es: {
    summary: "RESUMEN",
    experience: "EXPERIENCIA LABORAL",
    education: "EDUCACIÓN",
    skills: "HABILIDADES",
    projects: "PROYECTOS",
    languages: "IDIOMAS",
    military: "SERVICIO MILITAR",
    contact: "CONTACTO",
    militaryStatus: {
      Completed: "Completado",
      Postponed: "Aplazado",
      Exempt: "Exento",
      None: "Ninguno",
    },
  },
  it: {
    summary: "RIEPILOGO",
    experience: "ESPERIENZA LAVORATIVA",
    education: "ISTRUZIONE",
    skills: "COMPETENZE",
    projects: "PROGETTI",
    languages: "LINGUE",
    military: "SERVIZIO MILITARE",
    contact: "CONTATTI",
    militaryStatus: {
      Completed: "Completato",
      Postponed: "Rinviato",
      Exempt: "Esente",
      None: "Nessuno",
    },
  },
};

interface ResumeTemplatesProps {
  resume: ResumeDto;
  translation: ResumeTranslationDto;
  templateId?: TemplateId;
  colorThemeId?: ColorThemeId;
  tLabels?: {
    summary?: string;
    experience?: string;
    education?: string;
    skills?: string;
    projects?: string;
    languages?: string;
    military?: string;
    militaryStatus?: Record<string, string>;
  };
}

export const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({
  resume,
  translation,
  templateId = "modern",
  colorThemeId = "blue",
  tLabels,
}) => {
  const theme = COLOR_THEMES[colorThemeId] || COLOR_THEMES.blue;
  const profile = resume.profile;
  const fullName = profile?.fullName || translation.title.split("-")[0].trim();
  const title = profile?.title || "Professional Applicant";

  const langCode = (translation.languageCode || "en").toLowerCase();
  const defaultLabels = SECTION_LABELS_BY_LANG[langCode] || SECTION_LABELS_BY_LANG.en;
  
  // CV document section headers MUST strictly follow the CV document language (translation.languageCode), NOT web UI locale
  const labels = {
    ...(tLabels || {}),
    ...defaultLabels,
    militaryStatus: {
      ...(tLabels?.militaryStatus || {}),
      ...defaultLabels.militaryStatus,
    },
  };

  const formattedLocation = (loc?: string | null) => {
    if (!loc) return "";
    let clean = loc.replace(/\//g, ", ");
    if (langCode === "en") {
      clean = clean.replace(/İstanbul/gi, "Istanbul").replace(/Türkiye/gi, "Turkey");
    } else if (langCode === "de") {
      clean = clean.replace(/İstanbul/gi, "Istanbul").replace(/Turkey|Türkiye/gi, "Türkei");
    } else if (langCode === "tr") {
      clean = clean.replace(/Istanbul/gi, "İstanbul").replace(/Turkey/gi, "Türkiye");
    } else if (langCode === "fr") {
      clean = clean.replace(/İstanbul/gi, "Istanbul").replace(/Turkey|Türkiye/gi, "Turquie");
    } else if (langCode === "es" || langCode === "it") {
      clean = clean.replace(/İstanbul/gi, "Istanbul").replace(/Turkey|Türkiye/gi, "Turquía");
    }
    return clean;
  };

  const renderSectionHeader = (label: string, styleVariant: "modern" | "executive" | "sidebar" | "minimal") => {
    if (styleVariant === "executive") {
      return (
        <div className="border-b-2 border-t border-zinc-900 dark:border-zinc-100 py-1 my-4 [break-after:avoid] [page-break-after:avoid]">
          <h3 className="text-xs font-serif uppercase tracking-widest text-zinc-900 dark:text-zinc-100 font-bold text-center">
            {label}
          </h3>
        </div>
      );
    }

    if (styleVariant === "minimal") {
      return (
        <div className="mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 [break-after:avoid] [page-break-after:avoid]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            // {label}
          </h3>
        </div>
      );
    }

    if (styleVariant === "sidebar") {
      return (
        <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textClass} border-b ${theme.borderClass} pb-1 mb-3 [break-after:avoid] [page-break-after:avoid]`}>
          {label}
        </h3>
      );
    }

    // Default: Modern
    return (
      <h3 className={`text-xs font-extrabold uppercase tracking-widest ${theme.primaryClass} border-b ${theme.borderClass}/30 pb-1.5 mb-3 [break-after:avoid] [page-break-after:avoid]`}>
        {label}
      </h3>
    );
  };

  const cleanExperienceHtml = (htmlContent?: string | null) => {
    if (!htmlContent) return "";
    return htmlContent
      .replace(/(<\/strong>)\s+at\s+/gi, "$1 | ")
      .replace(/(\b\w+)\s+at\s+([A-Z])/g, "$1 | $2")
      .replace(/\bTechologies\b/gi, "Technologies")
      .replace(/^<p>\s*(Teknik Yetkinlikler|Yetenekler|Skills|Technical Skills|İş Deneyimi|Work Experience|Eğitim|Education)\s*:?\s*<\/p>/gi, "")
      .replace(/^<(h[1-4])>\s*(Teknik Yetkinlikler|Yetenekler|Skills|Technical Skills|İş Deneyimi|Work Experience|Eğitim|Education)\s*:?\s*<\/\1>/gi, "")
      .replace(/^<strong>\s*(Teknik Yetkinlikler|Yetenekler|Skills|Technical Skills)\s*:?\s*<\/strong>\s*(<br\s*\/?>)?/gi, "")
      .replace(/<p>\s*(&nbsp;|<br\s*\/?>|\s*)*<\/p>/gi, "")
      .replace(/(<br\s*\/?>\s*){2,}/gi, "<br />");
  };

  const renderSocialLinks = (socialLinks?: string[], textClass: string = `${theme.primaryClass} hover:underline`) => {
    if (!socialLinks || socialLinks.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium">
        {socialLinks.map((link, idx) => {
          let linkName = link.replace(/^https?:\/\//, "").replace(/\/$/, "");
          if (linkName.includes("github.com")) linkName = "GitHub";
          else if (linkName.includes("linkedin.com")) linkName = "LinkedIn";
          return (
            <a
              key={idx}
              href={link.startsWith("http") ? link : `https://${link}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center cursor-pointer relative z-10 ${textClass}`}
            >
              {linkName}
            </a>
          );
        })}
      </div>
    );
  };

  // Renderers for HTML fields
  const renderHtmlSection = (htmlContent?: string | null, label?: string, styleVariant: "modern" | "executive" | "sidebar" | "minimal" = "modern") => {
    if (!htmlContent) return null;
    const cleanedHtml = cleanExperienceHtml(htmlContent);
    return (
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        {label && renderSectionHeader(label, styleVariant)}
        <div
          className="prose prose-zinc dark:prose-invert prose-xs sm:prose-sm max-w-none prose-headings:mt-1.5 prose-headings:mb-1 prose-h3:mt-2 prose-h3:mb-1 prose-h3:text-xs sm:prose-h3:text-sm prose-h3:font-bold prose-h3:[break-after:avoid] prose-h3:[page-break-after:avoid] prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:my-0.5 prose-p:leading-snug prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:[break-inside:avoid] prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5 prose-li:leading-snug prose-li:[break-inside:avoid]"
          dangerouslySetInnerHTML={{ __html: cleanedHtml }}
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 1: Modern Classic
  // ----------------------------------------------------
  if (templateId === "modern") {
    return (
      <div id="cv-document-container" className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[850px] flex flex-col gap-6 transition-all duration-300">
        {/* Document Header */}
        <div className={`border-b-2 ${theme.borderClass}/30 pb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {profile?.showPhoto && profile?.photoUrl && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
                <img src={profile.photoUrl} alt={fullName} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
                {fullName}
              </h2>
              <p className={`text-sm font-semibold ${theme.primaryClass} mt-2 uppercase tracking-wide`}>
                {title}
              </p>

              {/* Social Links */}
              {renderSocialLinks(profile?.socialLinks)}
            </div>
          </div>

          <div className="flex flex-col text-xs text-zinc-500 dark:text-zinc-400 gap-1 sm:text-right font-medium shrink-0">
            {profile?.email && <span>{profile.email}</span>}
            {profile?.phone && <span>{profile.phone}</span>}
            {profile?.location && <span>{formattedLocation(profile.location)}</span>}
            {profile?.militaryStatus && profile.militaryStatus !== "None" && (
              <span>
                {labels.military}: {labels.militaryStatus[profile.militaryStatus] || profile.militaryStatus}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {translation.summary && (
          <div className="flex flex-col gap-2">
            {renderSectionHeader(labels.summary, "modern")}
            <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed italic border-l-2 border-primary/30 pl-3">
              {translation.summary}
            </p>
          </div>
        )}

        {/* Sections */}
        {renderHtmlSection(translation.experienceHtml, labels.experience, "modern")}
        {renderHtmlSection(translation.educationHtml, labels.education, "modern")}
        {renderHtmlSection(translation.skillsHtml, labels.skills, "modern")}
        {renderHtmlSection(translation.projectsHtml, labels.projects, "modern")}
        {renderHtmlSection(translation.languagesHtml, labels.languages, "modern")}
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 2: Executive Professional
  // ----------------------------------------------------
  if (templateId === "executive") {
    return (
      <div id="cv-document-container" className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-serif min-h-[850px] flex flex-col gap-4">
        {/* Executive Header */}
        <div className="text-center border-b-2 border-zinc-900 dark:border-zinc-100 pb-5">
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
            {fullName}
          </h2>
          <p className="text-xs font-sans uppercase tracking-widest text-zinc-600 dark:text-zinc-400 mt-1 font-semibold">
            {title}
          </p>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-sans text-zinc-600 dark:text-zinc-400 mt-3 border-t border-zinc-200 dark:border-zinc-800 pt-2">
            {profile?.email && <span>{profile.email}</span>}
            {profile?.phone && <span>• {profile.phone}</span>}
            {profile?.location && <span>• {formattedLocation(profile.location)}</span>}
            {profile?.militaryStatus && profile.militaryStatus !== "None" && (
              <span>• {labels.military}: {labels.militaryStatus[profile.militaryStatus] || profile.militaryStatus}</span>
            )}
          </div>
          <div className="flex justify-center mt-2">
            {renderSocialLinks(profile?.socialLinks, "text-zinc-700 dark:text-zinc-300 hover:underline font-serif")}
          </div>
        </div>

        {/* Executive Summary */}
        {translation.summary && (
          <div className="my-2">
            {renderSectionHeader(labels.summary, "executive")}
            <p className="text-xs font-sans leading-relaxed text-zinc-700 dark:text-zinc-300 text-justify">
              {translation.summary}
            </p>
          </div>
        )}

        {renderHtmlSection(translation.experienceHtml, labels.experience, "executive")}
        {renderHtmlSection(translation.educationHtml, labels.education, "executive")}
        {renderHtmlSection(translation.skillsHtml, labels.skills, "executive")}
        {renderHtmlSection(translation.projectsHtml, labels.projects, "executive")}
        {renderHtmlSection(translation.languagesHtml, labels.languages, "executive")}
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 3: Left Sidebar / Split Column
  // ----------------------------------------------------
  if (templateId === "sidebar") {
    return (
      <div id="cv-document-container" className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl overflow-hidden font-sans min-h-[850px] grid grid-cols-1 md:grid-cols-12">
        {/* Left Column */}
        <div className={`md:col-span-4 ${theme.bgLightClass} p-6 sm:p-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-border/60`}>
          <div className="flex flex-col items-center text-center">
            {profile?.showPhoto && profile?.photoUrl ? (
              <img src={profile.photoUrl} alt={fullName} className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md mb-3" />
            ) : (
              <div className={`h-20 w-20 rounded-full ${theme.badgeClass} flex items-center justify-center text-2xl font-bold mb-3 shadow-xs`}>
                {fullName.charAt(0)}
              </div>
            )}
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
              {fullName}
            </h2>
            <p className={`text-xs font-semibold ${theme.primaryClass} mt-1 uppercase tracking-wide`}>
              {title}
            </p>
          </div>

          {/* Contact Details Box */}
          <div className="space-y-2 text-xs font-medium text-zinc-650 dark:text-zinc-300 border-t border-border/60 pt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{labels.contact}</h4>
            {profile?.email && <p className="truncate">{profile.email}</p>}
            {profile?.phone && <p>{profile.phone}</p>}
            {profile?.location && <p>{formattedLocation(profile.location)}</p>}
            {profile?.militaryStatus && profile.militaryStatus !== "None" && (
              <p>{labels.military}: {labels.militaryStatus[profile.militaryStatus] || profile.militaryStatus}</p>
            )}
            {renderSocialLinks(profile?.socialLinks, `${theme.textClass} hover:underline`)}
          </div>

          {/* Skills HTML in Sidebar */}
          {translation.skillsHtml && (
            <div className="space-y-2 border-t border-border/60 pt-4">
              {renderSectionHeader(labels.skills, "sidebar")}
              <div
                className="prose prose-xs max-w-none text-zinc-700 dark:text-zinc-300 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5 prose-p:my-0.5"
                dangerouslySetInnerHTML={{ __html: cleanExperienceHtml(translation.skillsHtml) }}
              />
            </div>
          )}

          {/* Languages HTML in Sidebar */}
          {translation.languagesHtml && (
            <div className="space-y-2 border-t border-border/60 pt-4">
              {renderSectionHeader(labels.languages, "sidebar")}
              <div
                className="prose prose-xs max-w-none text-zinc-700 dark:text-zinc-300 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5 prose-p:my-0.5"
                dangerouslySetInnerHTML={{ __html: cleanExperienceHtml(translation.languagesHtml) }}
              />
            </div>
          )}
        </div>

        {/* Right Main Content Column */}
        <div className="md:col-span-8 p-6 sm:p-10 flex flex-col gap-6">
          {translation.summary && (
            <div>
              {renderSectionHeader(labels.summary, "sidebar")}
              <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed italic border-l-2 border-primary/40 pl-3">
                {translation.summary}
              </p>
            </div>
          )}

          {renderHtmlSection(translation.experienceHtml, labels.experience, "sidebar")}
          {renderHtmlSection(translation.educationHtml, labels.education, "sidebar")}
          {renderHtmlSection(translation.projectsHtml, labels.projects, "sidebar")}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEMPLATE 4: Minimalist Clean
  // ----------------------------------------------------
  return (
    <div id="cv-document-container" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[850px] flex flex-col gap-5">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {fullName}
          </h2>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
            {title}
          </p>
          {renderSocialLinks(profile?.socialLinks, "text-zinc-600 dark:text-zinc-400 hover:underline font-mono")}
        </div>

        <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 sm:text-right">
          {profile?.email && <span>{profile.email}</span>}
          {profile?.phone && <span>| {profile.phone}</span>}
          {profile?.location && <span>| {formattedLocation(profile.location)}</span>}
        </div>
      </div>

      {translation.summary && (
        <div className="mb-1">
          {renderSectionHeader(labels.summary, "minimal")}
          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            {translation.summary}
          </p>
        </div>
      )}

      {renderHtmlSection(translation.experienceHtml, labels.experience, "minimal")}
      {renderHtmlSection(translation.educationHtml, labels.education, "minimal")}
      {renderHtmlSection(translation.skillsHtml, labels.skills, "minimal")}
      {renderHtmlSection(translation.projectsHtml, labels.projects, "minimal")}
      {renderHtmlSection(translation.languagesHtml, labels.languages, "minimal")}
    </div>
  );
};
