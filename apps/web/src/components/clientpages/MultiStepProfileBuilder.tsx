"use client";

import React, { useState } from "react";
import { Profile, Education, Experience, Project } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TagInput from "@/components/ui/tag-input";
import PhoneInput from "@/components/ui/phone-input";
import AutocompleteInput from "@/components/ui/autocomplete-input";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDate } from "@/utils/date";
import { LOCATIONS, JOB_TITLES, SKILLS, SCHOOL_NAMES, DEGREES } from "@/lib/autocomplete-data";
import { Plus, Trash2, User, Briefcase, GraduationCap, FolderGit2, Wrench, ChevronLeft, ChevronRight, Save, Globe, ExternalLink, Calendar, CheckSquare, Square } from "lucide-react";

interface MultiStepProfileBuilderProps {
  currentStep: number;
  profile: Partial<Profile>;
  onChangeProfile: (updated: Partial<Profile>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSaveProfile: () => void;
  isSaving: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const MultiStepProfileBuilder: React.FC<MultiStepProfileBuilderProps> = ({
  currentStep,
  profile,
  onChangeProfile,
  onNextStep,
  onPrevStep,
  onSaveProfile,
  isSaving,
  isFirstStep,
  isLastStep,
}) => {
  // Inline Experience Form State
  const [newExp, setNewExp] = useState({
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    isOngoing: false,
    description: "",
  });

  // Inline Education Form State
  const [newEdu, setNewEdu] = useState({
    institutionName: "",
    degree: "",
    startDate: "",
    endDate: "",
    isOngoing: false,
  });

  // Inline Project Form State
  const [newProj, setNewProj] = useState({
    projectName: "",
    description: "",
    projectUrl: "",
    repoUrl: "",
    skills: [] as string[],
  });

  // Inline Language Form State
  const [newLangName, setNewLangName] = useState("English");
  const [newLangLevel, setNewLangLevel] = useState("C1 (Advanced)");

  // Categorized Skill State
  const [selectedCategory, setSelectedCategory] = useState("Frontend");
  const [customCategory, setCustomCategory] = useState("");
  const [categorySkillsTags, setCategorySkillsTags] = useState<string[]>([]);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("photoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategorizedSkill = () => {
    if (categorySkillsTags.length === 0) return;
    const catName = selectedCategory === "Custom" ? customCategory.trim() : selectedCategory;
    if (!catName) return;

    const formattedSkill = `${catName}: ${categorySkillsTags.join(", ")}`;
    updateField("skills", [...safeSkills, formattedSkill]);
    setCategorySkillsTags([]);
    if (selectedCategory === "Custom") setCustomCategory("");
  };

  const updateField = (field: keyof Profile, value: unknown) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  // Safe helper for skills array to prevent page crash if profile.skills is string/null
  const safeSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const safeLanguages = Array.isArray(profile.languages) ? profile.languages : [];
  const safeExperiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  const safeEducations = Array.isArray(profile.educations) ? profile.educations : [];
  const safeProjects = Array.isArray(profile.projects) ? profile.projects : [];

  // Add Experience
  const handleAddExperience = () => {
    if (!newExp.companyName || !newExp.jobTitle) return;
    const finalExp = {
      id: `temp-${Date.now()}`,
      companyName: newExp.companyName,
      jobTitle: newExp.jobTitle,
      startDate: newExp.startDate,
      endDate: newExp.isOngoing ? "Present" : newExp.endDate,
      description: newExp.description,
    };
    updateField("experiences", [...safeExperiences, finalExp]);
    setNewExp({ companyName: "", jobTitle: "", startDate: "", endDate: "", isOngoing: false, description: "" });
  };

  const handleRemoveExperience = (idx: number) => {
    updateField("experiences", safeExperiences.filter((_, i) => i !== idx));
  };

  // Add Education
  const handleAddEducation = () => {
    if (!newEdu.institutionName || !newEdu.degree) return;
    const finalEdu = {
      id: `temp-${Date.now()}`,
      institutionName: newEdu.institutionName,
      degree: newEdu.degree,
      startDate: newEdu.startDate,
      endDate: newEdu.isOngoing ? "Present" : newEdu.endDate,
    };
    updateField("educations", [...safeEducations, finalEdu]);
    setNewEdu({ institutionName: "", degree: "", startDate: "", endDate: "", isOngoing: false });
  };

  const handleRemoveEducation = (idx: number) => {
    updateField("educations", safeEducations.filter((_, i) => i !== idx));
  };

  // Add Project
  const handleAddProject = () => {
    if (!newProj.projectName) return;
    const finalProj = {
      id: `temp-${Date.now()}`,
      projectName: newProj.projectName,
      description: newProj.description,
      projectUrl: newProj.projectUrl,
      repoUrl: newProj.repoUrl,
      skills: newProj.skills,
    };
    updateField("projects", [...safeProjects, finalProj]);
    setNewProj({ projectName: "", description: "", projectUrl: "", repoUrl: "", skills: [] });
  };

  const handleRemoveProject = (idx: number) => {
    updateField("projects", safeProjects.filter((_, i) => i !== idx));
  };

  // Add Language
  const handleAddLanguage = () => {
    if (!newLangName) return;
    const langStr = `${newLangName} (${newLangLevel})`;
    updateField("languages", [...safeLanguages, langStr]);
  };

  const handleRemoveLanguage = (idx: number) => {
    updateField("languages", safeLanguages.filter((_, i) => i !== idx));
  };

  // STEP 0: Personal Info, Photo, Military & Links
  if (currentStep === 0) {
    return (
      <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <User className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Step 1: Profile Name, Photo & Personal Info</h4>
        </div>

        {/* Profile Name (Required) */}
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
          <label className="text-xs font-bold text-primary block">Profile Name / Identifier (Profil Adı)</label>
          <Input
            value={profile.profileName || ""}
            onChange={(e) => updateField("profileName", e.target.value)}
            placeholder="e.g. Master Software Engineer CV, German Senior Developer"
            className="bg-background text-xs font-semibold"
          />
        </div>

        {/* Photo Options */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPhoto"
              checked={!!profile.showPhoto}
              onChange={(e) => updateField("showPhoto", e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="showPhoto" className="text-xs font-semibold text-foreground cursor-pointer">
              Display Photo on CV (Fotoğraf Gösterilsin)
            </label>
          </div>

          {profile.showPhoto && (
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-all">
                  <span>📁 Fotoğraf Seç (Select Image File)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>
                {profile.photoUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={profile.photoUrl}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary shadow-xs shrink-0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateField('photoUrl', '')}
                      className="text-xs text-destructive hover:bg-destructive/10 h-8"
                    >
                      Kaldır
                    </Button>
                  </div>
                )}
              </div>
              <Input
                value={profile.photoUrl || ''}
                onChange={(e) => updateField('photoUrl', e.target.value)}
                placeholder="Veya Görsel URL'si Girin (https://...)"
                className="text-xs"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Full Name</label>
            <Input
              value={profile.fullName || ""}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="e.g. Kerem Yılmaz"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Job Title / Headline</label>
            <AutocompleteInput
              suggestions={JOB_TITLES}
              value={profile.title || ""}
              onChange={(val) => updateField("title", val)}
              placeholder="e.g. Senior Full-Stack Engineer"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Email</label>
            <Input
              type="email"
              value={profile.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="kerem@example.com"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
            <PhoneInput
              value={profile.phone || ""}
              onChange={(val) => updateField("phone", val)}
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Location</label>
            <AutocompleteInput
              suggestions={LOCATIONS}
              value={profile.location || ""}
              onChange={(val) => updateField("location", val)}
              placeholder="Istanbul, Turkey"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Military Status (Askerlik Durumu)</label>
            <select
              value={profile.militaryStatus || "None"}
              onChange={(e) => {
                const val = e.target.value;
                updateField("militaryStatus", val);
                if (val !== "Postponed" && val !== "Tecilli") {
                  updateField("militaryPostponedUntil", "");
                }
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="None">None / Not Applicable</option>
              <option value="Completed">Completed (Yapıldı)</option>
              <option value="Postponed">Postponed (Tecilli)</option>
              <option value="Exempt">Exempt (Muaf)</option>
            </select>
          </div>

          {/* Conditional Military Postponed Date Input */}
          {(profile.militaryStatus === "Postponed" || profile.militaryStatus === "Tecilli") && (
            <div className="sm:col-span-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <label className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Postponed Until Date (Tecil Bitiş Tarihi)
              </label>
              <DatePicker
                value={
                  profile.militaryPostponedUntil
                    ? new Date(profile.militaryPostponedUntil).toISOString().split("T")[0]
                    : ""
                }
                onChange={(val) => updateField("militaryPostponedUntil", val)}
                placeholder="Tecil bitiş tarihi seçin"
              />
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Social Links (GitHub, LinkedIn, Portfolio)</label>
          <div className="flex flex-col gap-2">
            {(profile.socialLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={link}
                  onChange={(e) => {
                    const links = [...(profile.socialLinks || [])];
                    links[idx] = e.target.value;
                    updateField("socialLinks", links);
                  }}
                  placeholder="https://linkedin.com/in/username"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    const links = (profile.socialLinks || []).filter((_, i) => i !== idx);
                    updateField("socialLinks", links);
                  }}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateField("socialLinks", [...(profile.socialLinks || []), ""])}
              className="w-fit text-xs gap-1 border-dashed mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Link
            </Button>
          </div>
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={onNextStep}
          onSave={onSaveProfile}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
        />
      </div>
    );
  }

  // STEP 1: Work Experience (With Ongoing Switch)
  if (currentStep === 1) {
    return (
      <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Briefcase className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Step 2: Add Work Experience</h4>
        </div>

        {/* Form to add a new Work Experience directly */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">Add New Work Experience</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Input
              placeholder="Company Name (e.g. Google, Trendyol)"
              value={newExp.companyName}
              onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
            />
            <AutocompleteInput
              suggestions={JOB_TITLES}
              placeholder="Job Title (e.g. Senior Frontend Developer)"
              value={newExp.jobTitle}
              onChange={(val) => setNewExp({ ...newExp, jobTitle: val })}
            />
            <DatePicker
              placeholder="Başlangıç Tarihi"
              value={newExp.startDate}
              onChange={(val) => setNewExp({ ...newExp, startDate: val })}
            />
            
            {/* End Date / Ongoing Switch */}
            <div className="flex flex-col justify-center">
              {!newExp.isOngoing ? (
                <DatePicker
                  placeholder="Bitiş Tarihi"
                  value={newExp.endDate}
                  onChange={(val) => setNewExp({ ...newExp, endDate: val })}
                />
              ) : (
                <div className="h-9 rounded-md bg-muted/60 border border-border px-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Present (Hala Çalışıyorum)
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="expOngoing"
              checked={newExp.isOngoing}
              onChange={(e) => {
                const checked = e.target.checked;
                setNewExp({
                  ...newExp,
                  isOngoing: checked,
                  endDate: checked ? "" : newExp.endDate,
                });
              }}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="expOngoing" className="text-xs font-semibold text-foreground cursor-pointer">
              Hala Çalışıyorum (Currently Working Here)
            </label>
          </div>

          <Textarea
            rows={3}
            placeholder="Key accomplishments & bullet points (e.g. Led micro-frontend migration...)"
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            className="text-xs"
          />
          <Button
            size="sm"
            onClick={handleAddExperience}
            disabled={!newExp.companyName || !newExp.jobTitle}
            className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </Button>
        </div>

        {/* Active List of Added Experiences */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Experiences ({safeExperiences.length})</label>
          {safeExperiences.map((exp: Experience, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border/70 text-xs flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-foreground">{exp.jobTitle || exp.role} <span className="text-primary">@ {exp.companyName}</span></p>
                <p className="text-muted-foreground text-[11px]">
                  {formatDate(exp.startDate)} - {exp.endDate === "Present" || !exp.endDate ? "Present" : formatDate(exp.endDate)}
                </p>
                {exp.description && <p className="text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveExperience(idx)}
                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={onNextStep}
          onSave={onSaveProfile}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
        />
      </div>
    );
  }

  // STEP 2: Education (With Ongoing Switch)
  if (currentStep === 2) {
    return (
      <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Step 3: Add Education</h4>
        </div>

        {/* Form to add a new Education entry */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">Add New Education Entry</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <AutocompleteInput
              suggestions={SCHOOL_NAMES}
              placeholder="School / University Name"
              value={newEdu.institutionName}
              onChange={(val) => setNewEdu({ ...newEdu, institutionName: val })}
            />
            <AutocompleteInput
              suggestions={DEGREES}
              placeholder="Degree / Major (e.g. B.S. Computer Engineering)"
              value={newEdu.degree}
              onChange={(val) => setNewEdu({ ...newEdu, degree: val })}
            />
            <DatePicker
              placeholder="Başlangıç Tarihi"
              value={newEdu.startDate}
              onChange={(val) => setNewEdu({ ...newEdu, startDate: val })}
            />

            {/* End Date / Ongoing Switch */}
            <div className="flex flex-col justify-center">
              {!newEdu.isOngoing ? (
                <DatePicker
                  placeholder="Bitiş Tarihi"
                  value={newEdu.endDate}
                  onChange={(val) => setNewEdu({ ...newEdu, endDate: val })}
                />
              ) : (
                <div className="h-9 rounded-md bg-muted/60 border border-border px-3 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Present (Hala Okuyorum)
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="eduOngoing"
              checked={newEdu.isOngoing}
              onChange={(e) => {
                const checked = e.target.checked;
                setNewEdu({
                  ...newEdu,
                  isOngoing: checked,
                  endDate: checked ? "" : newEdu.endDate,
                });
              }}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="eduOngoing" className="text-xs font-semibold text-foreground cursor-pointer">
              Hala Okuyorum (Currently Studying Here)
            </label>
          </div>

          <Button
            size="sm"
            onClick={handleAddEducation}
            disabled={!newEdu.institutionName || !newEdu.degree}
            className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add Education
          </Button>
        </div>

        {/* Active List of Added Educations */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Educations ({safeEducations.length})</label>
          {safeEducations.map((edu: Education, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border/70 text-xs flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">{edu.degree}</p>
                <p className="text-muted-foreground text-[11px]">
                  {edu.institutionName || edu.schoolName} • {formatDate(edu.startDate)} - {edu.endDate === "Present" || !edu.endDate ? "Present" : formatDate(edu.endDate)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveEducation(idx)}
                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={onNextStep}
          onSave={onSaveProfile}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
        />
      </div>
    );
  }

  // STEP 3: Projects (With Live Demo & GitHub Repo Inputs + Skills Tags)
  if (currentStep === 3) {
    return (
      <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <FolderGit2 className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Step 4: Add Projects & Portfolio</h4>
        </div>

        {/* Form to add a new Project */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">Add New Project</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Input
              placeholder="Project Name (e.g. ResumeX AI Platform)"
              value={newProj.projectName}
              onChange={(e) => setNewProj({ ...newProj, projectName: e.target.value })}
            />
            <Input
              placeholder="Live Demo URL (e.g. https://resumex.com)"
              value={newProj.projectUrl}
              onChange={(e) => setNewProj({ ...newProj, projectUrl: e.target.value })}
            />
            <Input
              placeholder="GitHub Repo URL (e.g. https://github.com/user/repo)"
              value={newProj.repoUrl}
              onChange={(e) => setNewProj({ ...newProj, repoUrl: e.target.value })}
              className="sm:col-span-2"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Technologies Used (Skills for Project)</label>
            <TagInput
              suggestions={SKILLS}
              value={newProj.skills}
              onChange={(tags: string[]) => setNewProj({ ...newProj, skills: tags })}
              placeholder="Type technology & press Enter..."
            />
          </div>

          <Textarea
            rows={2}
            placeholder="Short description of technologies used and impact..."
            value={newProj.description}
            onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
            className="text-xs"
          />
          <Button
            size="sm"
            onClick={handleAddProject}
            disabled={!newProj.projectName}
            className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Add Project
          </Button>
        </div>

        {/* Active List of Added Projects */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Projects ({safeProjects.length})</label>
          {safeProjects.map((proj: Project, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border/70 text-xs flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-foreground">{proj.projectName}</p>
                {proj.description && <p className="text-muted-foreground text-[11px] line-clamp-2">{proj.description}</p>}
                
                {/* Project Links & Tech tags */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold">
                      <ExternalLink className="h-3 w-3" /> Live Demo
                    </a>
                  )}
                  {proj.repoUrl && (
                    <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:underline flex items-center gap-1 font-semibold">
                      <FolderGit2 className="h-3 w-3" /> GitHub Repo
                    </a>
                  )}
                </div>

                {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.skills.map((s: string, sIdx: number) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveProject(idx)}
                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={onNextStep}
          onSave={onSaveProfile}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
        />
      </div>
    );
  }

  // STEP 4: Skills, Languages & Summary (Safely handling array mapping without crash!)
  return (
    <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Wrench className="h-4 w-4 text-primary" />
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Step 5: Technical Skills, Languages & Summary</h4>
      </div>

      <div className="space-y-4">
        {/* Categorized Skills Section */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground block">
              Kategorili Yetenek Ekle (Categorized Skills)
            </label>
            <span className="text-[10px] text-muted-foreground">
              Örn: Frontend: React, TypeScript
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Kategori Başlığı (Category)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="Frontend">Frontend Development</option>
                <option value="Backend">Backend Development</option>
                <option value="Database">Database & Data</option>
                <option value="DevOps">DevOps & Cloud</option>
                <option value="Mobile">Mobile App Development</option>
                <option value="Soft Skills">Soft Skills & Leadership</option>
                <option value="Custom">Özel Kategori (Custom...)</option>
              </select>
            </div>

            {selectedCategory === 'Custom' && (
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Özel Kategori Adı
                </label>
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Örn. Test & QA, AI Tools"
                  className="text-xs"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Beceriler (Skills list)
            </label>
            <TagInput
              suggestions={SKILLS}
              value={categorySkillsTags}
              onChange={(tags: string[]) => setCategorySkillsTags(tags)}
              placeholder="Yetenek yazıp Enter'a basın..."
            />
          </div>

          <Button
            size="sm"
            onClick={handleAddCategorizedSkill}
            disabled={categorySkillsTags.length === 0}
            className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Kategori & Becerileri Ekle
          </Button>
        </div>

        {/* General Tag Input Fallback */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Ek Beceriler (Tüm Liste)
          </label>
          <TagInput
            suggestions={SKILLS}
            value={safeSkills}
            onChange={(tags: string[]) => updateField('skills', tags)}
            placeholder="Tekil yetenek yazıp Enter'a basın..."
          />
        </div>

        {/* Languages Entry */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Languages Spoken & Level</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Language (e.g. English, German)"
              value={newLangName}
              onChange={(e) => setNewLangName(e.target.value)}
              className="text-xs"
            />
            <select
              value={newLangLevel}
              onChange={(e) => setNewLangLevel(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
            >
              <option value="Native">Native</option>
              <option value="C2 (Fluent)">C2 (Fluent)</option>
              <option value="C1 (Advanced)">C1 (Advanced)</option>
              <option value="B2 (Upper Intermediate)">B2 (Upper Intermediate)</option>
              <option value="B1 (Intermediate)">B1 (Intermediate)</option>
            </select>
            <Button
              size="sm"
              onClick={handleAddLanguage}
              className="text-xs shrink-0 bg-primary text-primary-foreground font-bold"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {safeLanguages.map((lang, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground"
              >
                <span>{lang}</span>
                <button
                  onClick={() => handleRemoveLanguage(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Professional Summary Bio</label>
          <Textarea
            rows={5}
            value={profile.summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            placeholder="Experienced software engineer with 5+ years building modern cloud-native web applications..."
            className="text-xs leading-relaxed"
          />
        </div>
      </div>

      <StepNavigationFooter
        onPrev={onPrevStep}
        onNext={onNextStep}
        onSave={onSaveProfile}
        isFirst={isFirstStep}
        isLast={isLastStep}
        isSaving={isSaving}
      />
    </div>
  );
};

interface FooterProps {
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
}

const StepNavigationFooter: React.FC<FooterProps> = ({ onPrev, onNext, onSave, isFirst, isLast, isSaving }) => (
  <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
    <Button
      size="sm"
      variant="outline"
      onClick={onPrev}
      disabled={isFirst}
      className="text-xs gap-1"
    >
      <ChevronLeft className="h-3.5 w-3.5" /> Previous
    </Button>

    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={onSave}
        disabled={isSaving}
        className="text-xs gap-1 font-bold"
      >
        <Save className="h-3.5 w-3.5" /> Save Profile
      </Button>

      {!isLast && (
        <Button
          size="sm"
          onClick={onNext}
          className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  </div>
);
