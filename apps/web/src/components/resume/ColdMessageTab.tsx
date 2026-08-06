'use client';

import React, { useState, useEffect } from 'react';
import { ResumeTranslationDto, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Edit3,
  Save,
  Download,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

interface ColdMessageTabProps {
  translation: Partial<ResumeTranslationDto>;
  profile?: Profile | null;
  onSaveTranslation?: (updated: Partial<ResumeTranslationDto>) => Promise<boolean>;
  isSaving?: boolean;
}

export const ColdMessageTab: React.FC<ColdMessageTabProps> = ({
  translation,
  profile,
  onSaveTranslation,
  isSaving = false,
}) => {
  const tToast = useTranslations('toast');

  const getFallbackColdMessage = () => {
    const lang = (translation.languageCode || 'en').toLowerCase();
    const title = translation.title || 'Software Specialist';
    const name = profile?.fullName || 'Applicant';

    if (lang === 'tr') {
      return `Konu: ${title} Fırsatı Hakkında - ${name}\n\nMerhaba [İşe Alım Uzmanı / Yönetici Adı],\n\nŞirketinizdeki ${title} pozisyonunu ilgiyle inceledim. Yazılım geliştirme alanındaki tecrübem ve projelerdeki başarılarımla ekibinize doğrudan katkı sağlayabileceğime inanıyorum.\n\nDetayları görüşmek üzere bu hafta 5 dakikalık kısa bir görüşme gerçekleştirebilirsek çok sevinirim.\n\nİyi çalışmalar,\n${name}`;
    }
    if (lang === 'de') {
      return `Betreff: Interesse an der Position ${title} - ${name}\n\nHallo [Name des Personalverantwortlichen],\n\nich habe Ihre Stellenausschreibung für die Position ${title} mit großem Interesse gesehen. Mit meiner Erfahrung im Bereich Softwareentwicklung würde ich mich freuen, mich kurz mit Ihnen auszutauschen.\n\nMit freundlichen Grüßen,\n${name}`;
    }
    if (lang === 'fr') {
      return `Objet : Candidature au poste de ${title} - ${name}\n\nBonjour [Nom du recruteur],\n\nJ'ai pris connaissance de votre offre pour le poste de ${title} avec beaucoup d'intérêt. Fort de mon expérience, je serais ravi d'échanger brièvement avec vous.\n\nCordialement,\n${name}`;
    }
    return `Subject: Exploring ${title} Opportunity - ${name}\n\nHi [Hiring Manager / Recruiter Name],\n\nI recently came across the ${title} position at your company. With my core background in software engineering and track record of building scalable solutions, I believe I can bring immediate value to your ongoing projects.\n\nI would love to connect briefly or share my portfolio if you have 5 minutes this week.\n\nBest regards,\n${name}`;
  };

  const [content, setContent] = useState<string>(
    translation.coldMessage || getFallbackColdMessage(),
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setContent(translation.coldMessage || getFallbackColdMessage());
    setIsEditing(false);
  }, [translation.coldMessage, translation.languageCode, translation.id, translation.title]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(tToast('copiedSuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(tToast('copiedFailed'));
    }
  };

  const handleSave = async () => {
    if (onSaveTranslation) {
      const success = await onSaveTranslation({ coldMessage: content });
      if (success) {
        setIsEditing(false);
        toast.success(tToast('coldMessageSaved'));
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile?.fullName || 'Cold_Message').replace(/\s+/g, '_')}_Cold_Message.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(tToast('downloadSuccess'));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/80 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Cold Message / LinkedIn & Email Outreach
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                AI Outreach
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              High-converting message for recruiters & hiring managers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="rounded-xl gap-1.5 cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Message</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="rounded-xl gap-1.5 cursor-pointer text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .txt</span>
          </Button>

          {isEditing ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl gap-1.5 cursor-pointer text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-xl gap-1.5 cursor-pointer text-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Message Card Container */}
      <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-6 sm:p-10 font-sans min-h-[550px] flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Direct Recruiter Message Template
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Chars: {content.length} | Words: {content.split(/\s+/).filter(Boolean).length}
          </span>
        </div>

        {/* Content View / Editor */}
        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Edit Message Content:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[380px] p-4 text-sm font-mono rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-hidden leading-relaxed resize-y"
              placeholder="Write your cold message..."
            />
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200 shadow-inner">
            {content}
          </div>
        )}

        {/* Outreach Tips Box */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
          <p className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            Pro Outreach Tips:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
            <li>
              Replace <span className="font-mono font-semibold text-foreground">[Hiring Manager / Recruiter Name]</span> with the actual name on LinkedIn for 3x higher response rates.
            </li>
            <li>
              Keep InMail messages under 150 words for optimal mobile readability.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
