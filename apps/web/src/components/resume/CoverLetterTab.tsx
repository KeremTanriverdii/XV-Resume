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
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

interface CoverLetterTabProps {
  translation: Partial<ResumeTranslationDto>;
  profile?: Profile | null;
  onSaveTranslation?: (updated: Partial<ResumeTranslationDto>) => Promise<boolean>;
  isSaving?: boolean;
}

export const CoverLetterTab: React.FC<CoverLetterTabProps> = ({
  translation,
  profile,
  onSaveTranslation,
  isSaving = false,
}) => {
  const tToast = useTranslations('toast');

  const getFallbackCoverLetter = () => {
    const lang = (translation.languageCode || 'en').toLowerCase();
    const title = translation.title || 'Software Specialist';
    const name = profile?.fullName || 'Applicant';

    if (lang === 'tr') {
      return `Sayın İşe Alım Yöneticisi,\n\n${title} pozisyonuna olan ilgimi belirtmek isterim. Yazılım geliştirme geçmişim ve temel yetkinliklerimle ekibinize hızlıca değer katacağıma inanıyorum.\n\nKariyerim boyunca yüksek kaliteli kod yazımı, sistem ölçeklenebilirliği ve karmaşık problemleri çözme üzerine odaklandım. Niteliklerimin şirket hedeflerinizle nasıl örtüştüğünü detaylandırmak üzere bir görüşme gerçekleştirmekten memnuniyet duyarım.\n\nSaygılarımla,\n${name}`;
    }
    if (lang === 'de') {
      return `Sehr geehrte Damen und Herren,\n\nhiermit bewerbe ich mich mit großem Interesse um die Stelle als ${title}. Mit meiner fachlichen Erfahrung bin ich überzeugt, einen wertvollen Beitrag zu Ihrem Team leisten zu können.\n\nMit freundlichen Grüßen,\n${name}`;
    }
    if (lang === 'fr') {
      return `Madame, Monsieur,\n\nC'est avec un grand intérêt que je vous adresse ma candidature pour le poste de ${title}. Fort de mon parcours et de mes compétences, je suis convaincu de pouvoir apporter une contribution significative à votre équipe.\n\nCordialement,\n${name}`;
    }
    return `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the ${title} position. With my technical background and key skills, I am confident in my ability to deliver immediate value to your engineering team.\n\nThroughout my career, I have focused on clean code, scalability, and solving complex challenges. I would welcome the opportunity to discuss how my qualifications align with your company's goals.\n\nSincerely,\n${name}`;
  };

  const [content, setContent] = useState<string>(
    translation.coverLetter || getFallbackCoverLetter(),
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setContent(translation.coverLetter || getFallbackCoverLetter());
    setIsEditing(false);
  }, [translation.coverLetter, translation.languageCode, translation.id, translation.title]);

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
      const success = await onSaveTranslation({ coverLetter: content });
      if (success) {
        setIsEditing(false);
        toast.success(tToast('coverLetterSaved'));
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
    a.download = `${(profile?.fullName || 'Cover_Letter').replace(/\s+/g, '_')}_Cover_Letter.txt`;
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
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Tailored Cover Letter / Ön Yazı
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI Generated
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Customized for the job advertisement and employer requirements.
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
                <span>Copy Text</span>
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

      {/* Document View / Editor */}
      <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-xl p-8 sm:p-12 font-sans min-h-[650px] flex flex-col gap-6">
        {/* Header Details */}
        <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {profile?.fullName || 'Applicant Name'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              {translation.title || profile?.title}
            </p>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 text-left sm:text-right space-y-0.5">
            {profile?.email && <p>{profile.email}</p>}
            {profile?.phone && <p>{profile.phone}</p>}
            {profile?.location && <p>{profile.location}</p>}
            <p className="font-medium text-zinc-650 dark:text-zinc-300 mt-1">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content Section */}
        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Edit Cover Letter Content:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[450px] p-4 text-sm font-sans rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-hidden leading-relaxed resize-y"
              placeholder="Write your cover letter content here..."
            />
          </div>
        ) : (
          <div className="prose prose-zinc dark:prose-invert text-sm max-w-none leading-relaxed space-y-4 whitespace-pre-line text-zinc-800 dark:text-zinc-200">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};
