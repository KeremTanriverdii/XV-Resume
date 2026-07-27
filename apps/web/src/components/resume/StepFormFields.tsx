'use client';

import React from 'react';
import { Profile, ResumeDto, ResumeTranslationDto } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Sparkles,
  User,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Wrench,
  Globe,
  FileText,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface StepFormFieldsProps {
  currentStep: number;
  resume: Partial<ResumeDto>;
  translation: Partial<ResumeTranslationDto>;
  onChangeResume: (updatedResume: Partial<ResumeDto>) => void;
  onChangeTranslation: (
    updatedTranslation: Partial<ResumeTranslationDto>,
  ) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const StepFormFields: React.FC<StepFormFieldsProps> = ({
  currentStep,
  resume,
  translation,
  onChangeResume,
  onChangeTranslation,
  onNextStep,
  onPrevStep,
  isFirstStep,
  isLastStep,
}) => {
  const profile = (resume.profile || {}) as Partial<Profile>;

  const updateProfileField = (field: keyof Profile, value: unknown) => {
    onChangeResume({
      ...resume,
      profile: {
        ...profile,
        [field]: value,
      } as Profile,
    });
  };

  const updateTranslationField = (
    field: keyof ResumeTranslationDto,
    value: unknown,
  ) => {
    onChangeTranslation({
      ...translation,
      [field]: value,
    });
  };

  // STEP 0: Personal Info & Links
  if (currentStep === 0) {
    return (
      <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-foreground">
            Personal Details & Contact Links
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Full Name
            </label>
            <Input
              value={profile.fullName || ''}
              onChange={(e) => updateProfileField('fullName', e.target.value)}
              placeholder="e.g. Kerem Yılmaz"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Professional Title
            </label>
            <Input
              value={profile.title || ''}
              onChange={(e) => updateProfileField('title', e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={profile.email || ''}
              onChange={(e) => updateProfileField('email', e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Phone Number
            </label>
            <Input
              value={profile.phone || ''}
              onChange={(e) => updateProfileField('phone', e.target.value)}
              placeholder="+90 555 123 45 67"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Location
            </label>
            <Input
              value={profile.location || ''}
              onChange={(e) => updateProfileField('location', e.target.value)}
              placeholder="Istanbul, Turkey"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Military Status (Optional)
            </label>
            <select
              value={profile.militaryStatus || 'None'}
              onChange={(e) =>
                updateProfileField('militaryStatus', e.target.value)
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="None">None / Not Applicable</option>
              <option value="Completed">Completed (Yapıldı)</option>
              <option value="Postponed">Postponed (Tecilli)</option>
              <option value="Exempt">Exempt (Muaf)</option>
            </select>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-2 pt-3 border-t border-border/60">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
            <LinkIcon className="h-3.5 w-3.5" /> Social & Portfolio Links
            (LinkedIn, GitHub, Portfolio)
          </label>
          <div className="flex flex-col gap-2">
            {(profile.socialLinks || []).map((link: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...(profile.socialLinks || [])];
                    newLinks[idx] = e.target.value;
                    updateProfileField('socialLinks', newLinks);
                  }}
                  placeholder="https://linkedin.com/in/username"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    const newLinks = (profile.socialLinks || []).filter(
                      (_: string, i: number) => i !== idx,
                    );
                    updateProfileField('socialLinks', newLinks);
                  }}
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateProfileField('socialLinks', [
                  ...(profile.socialLinks || []),
                  '',
                ])
              }
              className="w-fit text-xs gap-1 border-dashed mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </Button>
          </div>
        </div>

        <StepNavigationButtons
          onNext={onNextStep}
          onPrev={onPrevStep}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </div>
    );
  }

  // STEP 1: Work Experience HTML / Details
  if (currentStep === 1) {
    return (
      <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Briefcase className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-foreground">Work Experience</h4>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Experience Details (Use bullet points or standard formatting)
          </label>
          <Textarea
            rows={8}
            value={translation.experienceHtml || ''}
            onChange={(e) =>
              updateTranslationField('experienceHtml', e.target.value)
            }
            placeholder={`<h3>Senior Software Engineer | Tech Corp</h3>\n<p>2022 - Present | Istanbul</p>\n<ul>\n  <li>Led development of high-scale React/Next.js applications.</li>\n  <li>Optimized PDF export engines reducing memory usage by 40%.</li>\n</ul>`}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <StepNavigationButtons
          onNext={onNextStep}
          onPrev={onPrevStep}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </div>
    );
  }

  // STEP 2: Education
  if (currentStep === 2) {
    return (
      <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-foreground">
            Education Details
          </h4>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Degree, University & Dates
          </label>
          <Textarea
            rows={6}
            value={translation.educationHtml || ''}
            onChange={(e) =>
              updateTranslationField('educationHtml', e.target.value)
            }
            placeholder={`<h3>B.S. Computer Engineering | ITU</h3>\n<p>2018 - 2022 | GPA: 3.6/4.0</p>`}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <StepNavigationButtons
          onNext={onNextStep}
          onPrev={onPrevStep}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </div>
    );
  }

  // STEP 3: Skills
  if (currentStep === 3) {
    return (
      <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Wrench className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-foreground">
            Skills & Technical Competencies
          </h4>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Skills (Technologies, Frameworks, Soft Skills)
          </label>
          <Textarea
            rows={6}
            value={translation.skillsHtml || ''}
            onChange={(e) =>
              updateTranslationField('skillsHtml', e.target.value)
            }
            placeholder={`<p><strong>Languages:</strong> TypeScript, JavaScript, Python, C#</p>\n<p><strong>Frameworks:</strong> React, Next.js, Node.js, Tailwind CSS</p>`}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <StepNavigationButtons
          onNext={onNextStep}
          onPrev={onPrevStep}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </div>
    );
  }

  // STEP 4: Languages
  if (currentStep === 4) {
    return (
      <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Globe className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-foreground">
            Languages & Proficiency
          </h4>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Languages List
          </label>
          <Textarea
            rows={5}
            value={translation.languagesHtml || ''}
            onChange={(e) =>
              updateTranslationField('languagesHtml', e.target.value)
            }
            placeholder={`<p><strong>Turkish:</strong> Native</p>\n<p><strong>English:</strong> Full Professional Proficiency (C1)</p>`}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        <StepNavigationButtons
          onNext={onNextStep}
          onPrev={onPrevStep}
          isFirst={isFirstStep}
          isLast={isLastStep}
        />
      </div>
    );
  }

  // STEP 5: Summary
  return (
    <div className="flex flex-col gap-4 bg-background p-4 sm:p-6 rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Professional Summary
        </h4>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1">
          Bio / Executive Summary
        </label>
        <Textarea
          rows={6}
          value={translation.summary || ''}
          onChange={(e) => updateTranslationField('summary', e.target.value)}
          placeholder="Passionate Full-Stack Engineer with 5+ years of experience building modern web applications..."
          className="text-xs leading-relaxed"
        />
      </div>

      <StepNavigationButtons
        onNext={onNextStep}
        onPrev={onPrevStep}
        isFirst={isFirstStep}
        isLast={isLastStep}
      />
    </div>
  );
};

interface StepNavProps {
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const StepNavigationButtons: React.FC<StepNavProps> = ({
  onNext,
  onPrev,
  isFirst,
  isLast,
}) => (
  <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
    <Button
      size="sm"
      variant="outline"
      onClick={onPrev}
      disabled={isFirst}
      className="text-xs"
    >
      Previous Step
    </Button>
    <Button
      size="sm"
      onClick={onNext}
      className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
    >
      {isLast ? 'Review Resume' : 'Next Step'}
    </Button>
  </div>
);
