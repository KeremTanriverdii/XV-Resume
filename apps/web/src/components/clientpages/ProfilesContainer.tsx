'use client';

import { useEffect, useState } from 'react';
import { Profile, ResumeDto, ResumeTranslationDto } from '@/types';
import ProfileListClient from './ProfileListClient';
import { UserMetadata } from '@supabase/supabase-js';
import { ProfileStepSidebar, ProfileStepInfo } from './ProfileStepSidebar';
import { MultiStepProfileBuilder } from './MultiStepProfileBuilder';
import {
  ResumeTemplates,
  TemplateId,
  ColorThemeId,
  COLOR_THEMES,
} from '@/components/resume/ResumeTemplates';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Download,
} from 'lucide-react';
import { ProtectedPreviewOverlay } from '@/components/resume/ProtectedPreviewOverlay';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  createProfile,
  updateProfile,
  fetchProfiles,
} from '@/services/profileService';
import { exportToPdf } from '@/utils/pdfExport';
import { formatDate } from '@/utils/date';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/hooks/useProfile';
import { Button } from '../ui/button';

interface ProfilesContainerProps {
  token: string | undefined;
  userId: string | undefined;
  metaData?: UserMetadata;
}

export default function ProfilesContainer({
  token,
  userId,
  metaData,
}: ProfilesContainerProps) {
  const t = useTranslations('profiles');
  const queryClient = useQueryClient();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>('modern');
  const [selectedColor, setSelectedColor] = useState<ColorThemeId>('blue');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState(
    'Save & Export Your CV',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<Partial<Profile>>({
    profileName: '',
    fullName: metaData?.full_name || metaData?.name || 'John Doe',
    title: '',
    email: metaData?.email || '[EMAIL_ADDRESS]',
    phone: '+1 234 567 890',
    location: 'New York, USA',
    showPhoto: false,
    militaryStatus: 'None',
    experiences: [],
    educations: [],
    projects: [],
    skills: [''],
    languages: [''],
    socialLinks: ['https://github.com/', 'https://linkedin.com/in/'],
  });

  // Auto-restore draft profile if user created it while logged out and just signed in
  useEffect(() => {
    if (!token || !userId) return;
    try {
      const savedDraftJson = localStorage.getItem(
        'pending_manual_profile_draft',
      );
      if (savedDraftJson) {
        const parsed = JSON.parse(savedDraftJson);
        if (parsed && parsed.previewProfile) {
          setPreviewProfile(parsed.previewProfile);
          if (parsed.selectedTemplate)
            setSelectedTemplate(parsed.selectedTemplate);
          if (parsed.selectedColor) setSelectedColor(parsed.selectedColor);

          localStorage.removeItem('pending_manual_profile_draft');
          toast.success(
            t('draftRestoredSuccess') ||
              'Giriş öncesi doldurduğunuz CV profili aktarıldı!',
          );
        }
      }
    } catch (e) {
      console.error('Error restoring manual profile draft:', e);
    }
  }, [token, userId]);

  // Auto-persist guest profile edits to localStorage on every change so refresh never loses data
  useEffect(() => {
    if (!userId && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'pending_manual_profile_draft',
          JSON.stringify({
            previewProfile,
            selectedTemplate,
            selectedColor,
          }),
        );
      } catch (e) {
        console.error('Error auto-saving guest draft:', e);
      }
    }
  }, [previewProfile, selectedTemplate, selectedColor, userId]);

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setPreviewProfile(profile);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = async () => {
    if (!token) {
      setAuthActionTitle(t('signInToSave'));
      setIsAuthModalOpen(true);
      return;
    }

    if (!editingProfile?.id) {
      try {
        const existing = await fetchProfiles(token);
        if (existing && existing.length >= 4) {
          toast.error(t('maxProfilesReached'));
          return;
        }
      } catch {}
    }

    setIsSaving(true);
    try {
      const isValidGuid = (id?: string) =>
        id
          ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              id,
            )
          : false;

      const rawExps = previewProfile.experiences || [];
      const rawEdus = previewProfile.educations || [];
      const rawProjs = previewProfile.projects || [];

      const parseDateToIso = (dateStr?: string | null): string => {
        if (!dateStr || dateStr === 'Present') return new Date().toISOString();
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) return d.toISOString();
        } catch {}
        return new Date().toISOString();
      };

      const payload = {
        profileName: previewProfile.profileName || 'Master CV Profile',
        fullName: previewProfile.fullName || '',
        title: previewProfile.title || '',
        email: previewProfile.email || '',
        phone: previewProfile.phone || '',
        location: previewProfile.location || '',
        summary: previewProfile.summary || '',
        skills: previewProfile.skills || [],
        languages: previewProfile.languages || [],
        socialLinks: previewProfile.socialLinks || [],
        militaryStatus: (previewProfile.militaryStatus as any) || 'None',
        militaryPostponedUntil: previewProfile.militaryPostponedUntil
          ? parseDateToIso(previewProfile.militaryPostponedUntil)
          : null,
        showPhoto: previewProfile.showPhoto || false,
        photoUrl: previewProfile.photoUrl || '',
        experienceJson: JSON.stringify(rawExps),
        educationJson: JSON.stringify(rawEdus),
        experiences: rawExps.map((e: any) => ({
          id: isValidGuid(e.id) ? e.id : undefined,
          companyName: e.companyName || '',
          role: e.role || e.jobTitle || '',
          startDate: parseDateToIso(e.startDate),
          endDate:
            e.endDate === 'Present' || !e.endDate
              ? null
              : parseDateToIso(e.endDate),
          isOngoing: e.isOngoing || e.endDate === 'Present' || !e.endDate,
          description: e.description || '',
          location: e.location || '',
        })),
        educations: rawEdus.map((e: any) => ({
          id: isValidGuid(e.id) ? e.id : undefined,
          schoolName:
            e.schoolName && e.schoolName.trim() !== ''
              ? e.schoolName
              : e.institutionName || '',
          degree: e.degree || '',
          fieldOfStudy: e.fieldOfStudy || '',
          startDate: parseDateToIso(e.startDate),
          endDate:
            e.endDate === 'Present' || !e.endDate
              ? null
              : parseDateToIso(e.endDate),
          isOngoing: e.isOngoing || e.endDate === 'Present' || !e.endDate,
          gpa: e.gpa || null,
        })),
        projects: rawProjs.map((p: any) => ({
          id: isValidGuid(p.id) ? p.id : undefined,
          title:
            p.title && p.title.trim() !== ''
              ? p.title
              : p.projectName || p.projectTitle || '',
          description: p.description || '',
          links:
            p.links && p.links.trim() !== ''
              ? p.links
              : p.projectUrl || p.url || '',
          repositoryUrl:
            p.repositoryUrl && p.repositoryUrl.trim() !== ''
              ? p.repositoryUrl
              : p.repoUrl || '',
          techologiesUsed:
            Array.isArray(p.skills) && p.skills.length > 0
              ? p.skills.join(', ')
              : p.techologiesUsed || p.technologies || '',
        })),
      };

      let savedResult: Profile | null = null;
      if (editingProfile?.id) {
        savedResult = await updateProfile(
          editingProfile.id,
          payload as any,
          token,
        );
      } else {
        savedResult = await createProfile(payload as any, token);
      }

      if (savedResult) {
        setEditingProfile(savedResult);
        setPreviewProfile(savedResult);
        toast.success(
          t('profileSavedSuccess') || 'Profil başarıyla kaydedildi!',
        );
        queryClient.invalidateQueries({ queryKey: profileKeys.all });
      } else {
        toast.error('Profil kaydedilemedi. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      toast.error(
        `Profil kaydedilirken hata oluştu: ${err?.message || 'Bilinmeyen hata'}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const steps: ProfileStepInfo[] = [
    {
      id: 0,
      key: 'personal',
      title: 'Personal Info',
      subtitle: 'Name, email, phone & title',
      icon: User,
      isComplete: !!previewProfile.fullName,
      liveDataSummary: previewProfile.fullName
        ? `${previewProfile.fullName} • ${previewProfile.title || previewProfile.profileName || 'No Title'}`
        : 'Not filled',
    },
    {
      id: 1,
      key: 'experiences',
      title: 'Work Experiences',
      subtitle: 'Work history & achievements',
      icon: Briefcase,
      isComplete: (previewProfile.experiences || []).length > 0,
      liveDataSummary: `${(previewProfile.experiences || []).length} Experiences Linked`,
    },
    {
      id: 2,
      key: 'education',
      title: 'Education',
      subtitle: 'Degrees & institutions',
      icon: GraduationCap,
      isComplete: (previewProfile.educations || []).length > 0,
      liveDataSummary: `${(previewProfile.educations || []).length} Educations Linked`,
    },
    {
      id: 3,
      key: 'projects',
      title: 'Projects',
      subtitle: 'Portfolio & key works',
      icon: FolderGit2,
      isComplete: (previewProfile.projects || []).length > 0,
      liveDataSummary: `${(previewProfile.projects || []).length} Projects Linked`,
    },
    {
      id: 4,
      key: 'skills',
      title: 'Skills & Summary',
      subtitle: 'Tech stack & bio',
      icon: Wrench,
      isComplete:
        (Array.isArray(previewProfile.skills) ? previewProfile.skills : [])
          .length > 0,
      liveDataSummary: `${(Array.isArray(previewProfile.skills) ? previewProfile.skills : []).length} Skills Added`,
    },
  ];

  // Live Resume & Translation
  const safeSkillsList = Array.isArray(previewProfile.skills)
    ? previewProfile.skills
    : [];
  const safeLanguagesList = Array.isArray(previewProfile.languages)
    ? previewProfile.languages
    : [];
  const safeExperiencesList = Array.isArray(previewProfile.experiences)
    ? previewProfile.experiences
    : [];
  const safeEducationsList = Array.isArray(previewProfile.educations)
    ? previewProfile.educations
    : [];
  const safeProjectsList = Array.isArray(previewProfile.projects)
    ? previewProfile.projects
    : [];

  const liveResume: any = {
    templateId: selectedTemplate,
    colorTheme: selectedColor,
    profile: {
      fullName: previewProfile.fullName || 'Your Name',
      title: previewProfile.title || 'Professional Title',
      email: previewProfile.email || '',
      phone: previewProfile.phone || '',
      location: previewProfile.location || '',
      photoUrl: previewProfile.photoUrl || '',
      showPhoto: previewProfile.showPhoto || false,
      socialLinks: previewProfile.socialLinks || [],
      militaryStatus: previewProfile.militaryStatus || 'None',
    } as any,
  };

  const formatDescriptionToBullets = (desc?: string): string => {
    if (!desc || !desc.trim()) return '';
    if (desc.includes('<ul>') || desc.includes('<li>')) {
      return desc;
    }
    const lines = desc
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s\-•*]+/, '').trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return '';
    return `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
  };

  const liveTranslation: Partial<ResumeTranslationDto> = {
    languageCode: 'en',
    title: previewProfile.profileName || 'Master CV Profile',
    summary:
      previewProfile.summary ||
      'Professional bio paragraph will render live here as you type...',
    experienceHtml: safeExperiencesList
      .map((exp) => {
        const titleLine = `<h3>${exp.jobTitle || exp.role || 'Position'} @ ${exp.companyName || 'Company'}</h3>`;
        const startStr = exp.startDate ? formatDate(exp.startDate) : '';
        const endStr =
          exp.endDate === 'Present' || !exp.endDate
            ? 'Present'
            : formatDate(exp.endDate);
        const dateLine = `<p>${startStr}${startStr && endStr ? ' - ' : ''}${endStr}</p>`;
        const descBullets = formatDescriptionToBullets(exp.description);
        return `${titleLine}${dateLine}${descBullets}`;
      })
      .join('<br/>'),
    educationHtml: safeEducationsList
      .map((edu) => {
        const startStr = edu.startDate ? formatDate(edu.startDate) : '';
        const endStr =
          edu.endDate === 'Present' || !edu.endDate
            ? 'Present'
            : formatDate(edu.endDate);
        return `<h3>${edu.degree || 'Degree'} @ ${edu.institutionName || edu.schoolName || 'University/School'}</h3><p>${startStr}${startStr && endStr ? ' - ' : ''}${endStr}</p>`;
      })
      .join('<br/>'),
    projectsHtml: safeProjectsList
      .map((proj) => {
        const titleLine = `<h3>${proj.projectName || proj.title || 'Project'}</h3>`;
        const descBullets = formatDescriptionToBullets(proj.description);
        return `${titleLine}${descBullets}`;
      })
      .join('<br/>'),
    skillsHtml: (() => {
      if (!safeSkillsList.length) return '';
      const categorized: string[] = [];
      const uncategorized: string[] = [];

      safeSkillsList.forEach((s) => {
        if (!s || !s.trim()) return;
        if (s.includes(':')) {
          const parts = s.split(':');
          const category = parts[0].trim();
          const items = parts.slice(1).join(':').trim();
          if (category && items) {
            categorized.push(`<p><strong>${category}:</strong> ${items}</p>`);
          } else {
            uncategorized.push(s.trim());
          }
        } else {
          uncategorized.push(s.trim());
        }
      });

      let uncategorizedHtml = '';
      if (uncategorized.length > 0) {
        if (categorized.length > 0) {
          uncategorizedHtml = `<p><strong>Ek Beceriler:</strong> ${uncategorized.join(', ')}</p>`;
        } else {
          uncategorizedHtml = `<p>${uncategorized.join(', ')}</p>`;
        }
      }

      return [...categorized, uncategorizedHtml].filter(Boolean).join('');
    })(),
    languagesHtml: safeLanguagesList.length
      ? `<p><strong>Languages:</strong> ${safeLanguagesList.join(', ')}</p>`
      : '',
  };

  const handleActionTrigger = (action: 'download' | 'email' | 'save') => {
    if (!userId) {
      try {
        localStorage.setItem(
          'pending_manual_profile_draft',
          JSON.stringify({
            previewProfile,
            selectedTemplate,
            selectedColor,
          }),
        );
      } catch (e) {
        console.error('Error saving draft profile to localStorage:', e);
      }

      setAuthActionTitle(
        action === 'download'
          ? t('signInToDownload')
          : action === 'email'
            ? t('signInToEmail')
            : t('signInToSave'),
      );
      setIsAuthModalOpen(true);
    } else if (action === 'download') {
      exportToPdf({
        filename: `${(previewProfile.fullName || 'CV').replace(/\s+/g, '_')}_Resume.pdf`,
        elementId: 'cv-document-container',
      });
    }
  };

  return (
    <main className="flex flex-col gap-6 p-2 md:p-4 w-full max-w-[1700px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t('builderTitle')}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('builderSubtitle')}
          </p>
        </div>

        {/* Template & Color Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
            {(
              ['modern', 'executive', 'sidebar', 'minimal'] as TemplateId[]
            ).map((tId) => (
              <Button
                key={tId}
                onClick={() => setSelectedTemplate(tId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedTemplate === tId
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tId}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {(Object.keys(COLOR_THEMES) as ColorThemeId[]).map((cId) => (
              <Button
                key={cId}
                onClick={() => setSelectedColor(cId)}
                className={`h-6 w-6 rounded-full border-2 transition-transform ${
                  selectedColor === cId
                    ? 'border-primary scale-110'
                    : 'border-transparent opacity-75'
                }`}
                style={{ backgroundColor: COLOR_THEMES[cId].hex }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Left Sidebar (Step Nav + Live Summaries) | Middle Form | Right Template Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (3 cols): Step Sidebar with Live Summaries */}
        <div className="lg:col-span-3 space-y-4">
          <ProfileStepSidebar
            currentStep={currentStep}
            onSelectStep={(stepId) => setCurrentStep(stepId)}
            steps={steps}
            profileName={previewProfile.profileName}
          />
        </div>

        {/* Middle Column (5 cols): Multi-Step Form Fields */}
        <div className="lg:col-span-5 space-y-4">
          <MultiStepProfileBuilder
            currentStep={currentStep}
            profile={previewProfile}
            onChangeProfile={(updated) => setPreviewProfile(updated)}
            onNextStep={() => setCurrentStep((prev) => Math.min(prev + 1, 4))}
            onPrevStep={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            onSaveProfile={handleSaveProfile}
            isSaving={isSaving}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === 4}
            isAuthenticated={!!userId}
          />
        </div>

        {/* Right Column (4 cols): Real-Time Synchronized A4 Template Preview */}
        <div className="lg:col-span-4 sticky top-4 space-y-3">
          <div className="p-2.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">
              {t('livePreview')}
            </span>
            <div className="flex items-center gap-2">
              {userId && (
                <Button
                  onClick={() =>
                    exportToPdf({
                      filename: `${(previewProfile.fullName || 'CV').replace(/\s+/g, '_')}_Resume.pdf`,
                      elementId: 'cv-document-container',
                    })
                  }
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> PDF Export
                </Button>
              )}
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />{' '}
                {t('realtimeSync')}
              </span>
            </div>
          </div>

          <ProtectedPreviewOverlay
            isAuthenticated={!!userId}
            onActionTrigger={handleActionTrigger}
          >
            <ResumeTemplates
              resume={liveResume as ResumeDto}
              translation={liveTranslation as ResumeTranslationDto}
              templateId={selectedTemplate}
              colorThemeId={selectedColor}
            />
          </ProtectedPreviewOverlay>
        </div>
      </div>

      {/* Bottom Full-Width Section: Saved Candidate Profiles */}
      <div className="mt-6 pt-6 border-t border-border">
        <ProfileListClient
          token={token}
          userId={userId}
          onEdit={handleEditProfile}
          activeEditId={editingProfile?.id || null}
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={authActionTitle}
      />
    </main>
  );
}
