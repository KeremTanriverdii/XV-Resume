'use client';

import { useState } from 'react';
import { Profile, ResumeDto, ResumeTranslationDto } from '@/types';
import ProfileListClient from './ProfileListClient';
import { UserMetadata } from '@supabase/supabase-js';
import { ProfileStepSidebar, ProfileStepInfo } from './ProfileStepSidebar';
import { MultiStepProfileBuilder } from './MultiStepProfileBuilder';
import { ResumeTemplates, TemplateId, ColorThemeId, COLOR_THEMES } from '@/components/resume/ResumeTemplates';
import { User, Briefcase, GraduationCap, FolderGit2, Wrench } from 'lucide-react';
import { ProtectedPreviewOverlay } from '@/components/resume/ProtectedPreviewOverlay';
import { AuthModal } from '@/components/auth/AuthModal';
import { createProfile, updateProfile, fetchProfiles } from '@/services/profileService';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [selectedColor, setSelectedColor] = useState<ColorThemeId>('blue');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionTitle, setAuthActionTitle] = useState('Save & Export Your CV');
  const [isSaving, setIsSaving] = useState(false);

  // Live Sync Preview State constructed from active profile inputs
  const [previewProfile, setPreviewProfile] = useState<Partial<Profile>>({
    profileName: 'Ana CV Profilim',
    fullName: metaData?.full_name || metaData?.name || 'Kerem Yılmaz',
    title: 'Senior Full-Stack Engineer',
    email: metaData?.email || 'kerem@example.com',
    phone: '+90 555 123 45 67',
    location: 'Istanbul, Turkey',
    showPhoto: false,
    militaryStatus: 'None',
    experiences: [],
    educations: [],
    projects: [],
    skills: ['TypeScript', 'Next.js', 'React', 'Node.js', 'Tailwind CSS'],
    languages: ['Turkish (Native)', 'English (C1)'],
    socialLinks: ['https://github.com', 'https://linkedin.com'],
  });

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
        militaryStatus: (previewProfile.militaryStatus as any) || 'Default',
        showPhoto: previewProfile.showPhoto || false,
        photoUrl: previewProfile.photoUrl || '',
        experienceId: (previewProfile.experiences || []).map((e) => e.id),
        educationId: (previewProfile.educations || []).map((e) => e.id),
        projectId: (previewProfile.projects || []).map((p) => p.id),
      };

      if (editingProfile?.id) {
        await updateProfile(editingProfile.id, payload as any, token);
      } else {
        await createProfile(payload as any, token);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
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
      liveDataSummary: previewProfile.fullName ? `${previewProfile.fullName} • ${previewProfile.title || previewProfile.profileName || 'No Title'}` : 'Not filled',
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
      isComplete: (Array.isArray(previewProfile.skills) ? previewProfile.skills : []).length > 0,
      liveDataSummary: `${(Array.isArray(previewProfile.skills) ? previewProfile.skills : []).length} Skills Added`,
    },
  ];

  // Live Resume & Translation
  const safeSkillsList = Array.isArray(previewProfile.skills) ? previewProfile.skills : [];
  const safeLanguagesList = Array.isArray(previewProfile.languages) ? previewProfile.languages : [];
  const safeExperiencesList = Array.isArray(previewProfile.experiences) ? previewProfile.experiences : [];
  const safeEducationsList = Array.isArray(previewProfile.educations) ? previewProfile.educations : [];
  const safeProjectsList = Array.isArray(previewProfile.projects) ? previewProfile.projects : [];

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

  const liveTranslation: Partial<ResumeTranslationDto> = {
    languageCode: 'en',
    title: previewProfile.profileName || 'Master CV Profile',
    summary: previewProfile.summary || 'Professional bio paragraph will render live here as you type...',
    experienceHtml: safeExperiencesList
      .map(
        (exp) =>
          `<h3>${exp.jobTitle || exp.role || 'Position'} @ ${exp.companyName || 'Company'}</h3><p>${exp.startDate || ''} - ${exp.endDate || 'Present'}</p><p>${exp.description || ''}</p>`
      )
      .join('<br/>'),
    educationHtml: safeEducationsList
      .map(
        (edu) =>
          `<h3>${edu.degree || 'Degree'} @ ${edu.institutionName || edu.schoolName || 'University/School'}</h3><p>${edu.startDate || ''} - ${edu.endDate || 'Present'}</p>`
      )
      .join('<br/>'),
    projectsHtml: safeProjectsList
      .map(
        (proj) =>
          `<h3>${proj.projectName}</h3>${proj.description ? `<p>${proj.description}</p>` : ''}`
      )
      .join('<br/>'),
    skillsHtml: safeSkillsList.length
      ? safeSkillsList
          .map((s) => {
            if (s.includes(':')) {
              const parts = s.split(':');
              const category = parts[0].trim();
              const items = parts.slice(1).join(':').trim();
              return `<p><strong>${category}:</strong> ${items}</p>`;
            }
            return `<p>${s}</p>`;
          })
          .join('')
      : '',
    languagesHtml: safeLanguagesList.length
      ? `<p><strong>Languages:</strong> ${safeLanguagesList.join(', ')}</p>`
      : '',
  };

  const handleActionTrigger = (action: 'download' | 'email' | 'save') => {
    if (!userId) {
      setAuthActionTitle(
        action === 'download'
          ? t('signInToDownload')
          : action === 'email'
          ? t('signInToEmail')
          : t('signInToSave')
      );
      setIsAuthModalOpen(true);
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
            {(['modern', 'executive', 'sidebar', 'minimal'] as TemplateId[]).map((tId) => (
              <button
                key={tId}
                onClick={() => setSelectedTemplate(tId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedTemplate === tId
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tId}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {(Object.keys(COLOR_THEMES) as ColorThemeId[]).map((cId) => (
              <button
                key={cId}
                onClick={() => setSelectedColor(cId)}
                className={`h-6 w-6 rounded-full border-2 transition-transform ${
                  selectedColor === cId ? 'border-primary scale-110' : 'border-transparent opacity-75'
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
          />
        </div>

        {/* Right Column (4 cols): Real-Time Synchronized A4 Template Preview */}
        <div className="lg:col-span-4 sticky top-4 space-y-3">
          <div className="p-2.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{t('livePreview')}</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> {t('realtimeSync')}
            </span>
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
