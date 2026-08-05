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
import { Plus, Trash2, Pencil, User, Briefcase, GraduationCap, FolderGit2, Wrench, ChevronLeft, ChevronRight, Save, Globe, ExternalLink, Calendar, CheckSquare, Square } from "lucide-react";
import { useTranslations } from "next-intl";

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
  isAuthenticated?: boolean;
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
  isAuthenticated = false,
}) => {
  const t = useTranslations("profileBuilder");
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

  // Edit Mode Tracker States
  const [editingExpIdx, setEditingExpIdx] = useState<number | null>(null);
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [editingProjIdx, setEditingProjIdx] = useState<number | null>(null);
  const [editingLangIdx, setEditingLangIdx] = useState<number | null>(null);

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

  // --- Experience Handlers ---
  const handleEditExperience = (idx: number) => {
    const exp: any = safeExperiences[idx];
    if (!exp) return;
    setNewExp({
      companyName: exp.companyName || "",
      jobTitle: exp.jobTitle || exp.role || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate === "Present" ? "" : (exp.endDate || ""),
      isOngoing: exp.isOngoing || exp.endDate === "Present" || !exp.endDate,
      description: exp.description || "",
    });
    setEditingExpIdx(idx);
  };

  const handleCancelEditExperience = () => {
    setEditingExpIdx(null);
    setNewExp({ companyName: "", jobTitle: "", startDate: "", endDate: "", isOngoing: false, description: "" });
  };

  const handleAddExperience = () => {
    if (!newExp.companyName || !newExp.jobTitle) return;
    const existingId = editingExpIdx !== null ? (safeExperiences[editingExpIdx] as any)?.id : null;
    const finalExp = {
      id: existingId || `temp-${Date.now()}`,
      companyName: newExp.companyName,
      jobTitle: newExp.jobTitle,
      role: newExp.jobTitle,
      startDate: newExp.startDate,
      endDate: newExp.isOngoing ? "Present" : newExp.endDate,
      description: newExp.description,
    };

    if (editingExpIdx !== null) {
      const updated = [...safeExperiences];
      updated[editingExpIdx] = finalExp;
      updateField("experiences", updated);
      setEditingExpIdx(null);
    } else {
      updateField("experiences", [...safeExperiences, finalExp]);
    }
    setNewExp({ companyName: "", jobTitle: "", startDate: "", endDate: "", isOngoing: false, description: "" });
  };

  const handleRemoveExperience = (idx: number) => {
    if (editingExpIdx === idx) handleCancelEditExperience();
    updateField("experiences", safeExperiences.filter((_, i) => i !== idx));
  };

  // --- Education Handlers ---
  const handleEditEducation = (idx: number) => {
    const edu: any = safeEducations[idx];
    if (!edu) return;
    setNewEdu({
      institutionName: edu.institutionName || edu.schoolName || "",
      degree: edu.degree || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate === "Present" ? "" : (edu.endDate || ""),
      isOngoing: edu.isOngoing || edu.endDate === "Present" || !edu.endDate,
    });
    setEditingEduIdx(idx);
  };

  const handleCancelEditEducation = () => {
    setEditingEduIdx(null);
    setNewEdu({ institutionName: "", degree: "", startDate: "", endDate: "", isOngoing: false });
  };

  const handleAddEducation = () => {
    if (!newEdu.institutionName || !newEdu.degree) return;
    const existingId = editingEduIdx !== null ? (safeEducations[editingEduIdx] as any)?.id : null;
    const finalEdu = {
      id: existingId || `temp-${Date.now()}`,
      schoolName: newEdu.institutionName,
      institutionName: newEdu.institutionName,
      degree: newEdu.degree,
      startDate: newEdu.startDate,
      endDate: newEdu.isOngoing ? "Present" : newEdu.endDate,
    };

    if (editingEduIdx !== null) {
      const updated = [...safeEducations];
      updated[editingEduIdx] = finalEdu;
      updateField("educations", updated);
      setEditingEduIdx(null);
    } else {
      updateField("educations", [...safeEducations, finalEdu]);
    }
    setNewEdu({ institutionName: "", degree: "", startDate: "", endDate: "", isOngoing: false });
  };

  const handleRemoveEducation = (idx: number) => {
    if (editingEduIdx === idx) handleCancelEditEducation();
    updateField("educations", safeEducations.filter((_, i) => i !== idx));
  };

  // --- Project Handlers ---
  const handleEditProject = (idx: number) => {
    const proj: any = safeProjects[idx];
    if (!proj) return;
    const projSkills = Array.isArray(proj.skills) && proj.skills.length > 0
      ? proj.skills
      : (proj.techologiesUsed || proj.technologies || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    setNewProj({
      projectName: proj.title || proj.projectName || proj.projectTitle || "",
      projectUrl: proj.links || proj.projectUrl || proj.url || "",
      repoUrl: proj.repositoryUrl || proj.repoUrl || "",
      skills: projSkills,
      description: proj.description || "",
    });
    setEditingProjIdx(idx);
  };

  const handleCancelEditProject = () => {
    setEditingProjIdx(null);
    setNewProj({ projectName: "", description: "", projectUrl: "", repoUrl: "", skills: [] });
  };

  const handleAddProject = () => {
    if (!newProj.projectName) return;
    const existingId = editingProjIdx !== null ? (safeProjects[editingProjIdx] as any)?.id : null;
    const finalProj = {
      id: existingId || `temp-${Date.now()}`,
      title: newProj.projectName,
      projectName: newProj.projectName,
      projectTitle: newProj.projectName,
      description: newProj.description,
      links: newProj.projectUrl,
      projectUrl: newProj.projectUrl,
      repositoryUrl: newProj.repoUrl,
      repoUrl: newProj.repoUrl,
      skills: newProj.skills,
      techologiesUsed: newProj.skills.join(", "),
    };

    if (editingProjIdx !== null) {
      const updated = [...safeProjects];
      updated[editingProjIdx] = finalProj;
      updateField("projects", updated);
      setEditingProjIdx(null);
    } else {
      updateField("projects", [...safeProjects, finalProj]);
    }
    setNewProj({ projectName: "", description: "", projectUrl: "", repoUrl: "", skills: [] });
  };

  const handleRemoveProject = (idx: number) => {
    if (editingProjIdx === idx) handleCancelEditProject();
    updateField("projects", safeProjects.filter((_, i) => i !== idx));
  };

  // --- Language Handlers ---
  const handleEditLanguage = (idx: number) => {
    const langStr = safeLanguages[idx];
    if (!langStr) return;
    const match = langStr.match(/^(.+?)\s*\((.+)\)$/);
    if (match) {
      setNewLangName(match[1].trim());
      setNewLangLevel(match[2].trim());
    } else {
      setNewLangName(langStr);
    }
    setEditingLangIdx(idx);
  };

  const handleCancelEditLanguage = () => {
    setEditingLangIdx(null);
    setNewLangName("English");
    setNewLangLevel("C1 (Advanced)");
  };

  const handleAddLanguage = () => {
    if (!newLangName) return;
    const langStr = `${newLangName} (${newLangLevel})`;
    if (editingLangIdx !== null) {
      const updated = [...safeLanguages];
      updated[editingLangIdx] = langStr;
      updateField("languages", updated);
      setEditingLangIdx(null);
    } else {
      updateField("languages", [...safeLanguages, langStr]);
    }
    setNewLangName("English");
    setNewLangLevel("C1 (Advanced)");
  };

  const handleRemoveLanguage = (idx: number) => {
    if (editingLangIdx === idx) handleCancelEditLanguage();
    updateField("languages", safeLanguages.filter((_, i) => i !== idx));
  };

  const commitPendingInputs = () => {
    if (newExp.companyName && newExp.jobTitle) {
      handleAddExperience();
    }
    if (newEdu.institutionName && newEdu.degree) {
      handleAddEducation();
    }
    if (newProj.projectName) {
      handleAddProject();
    }
    if (categorySkillsTags.length > 0) {
      handleAddCategorizedSkill();
    }
  };

  const handleSaveWrapper = () => {
    commitPendingInputs();
    onSaveProfile();
  };

  const handleNextWrapper = () => {
    commitPendingInputs();
    onNextStep();
  };

  // STEP 0: Personal Info, Photo, Military & Links
  if (currentStep === 0) {
    return (
      <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <User className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">{t('step1Header')}</h4>
        </div>

        {/* Profile Name (Required) */}
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
          <label className="text-xs font-bold text-primary block">{t('profileNameLabel')}</label>
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
              {t('showPhotoLabel')}
            </label>
          </div>

          {profile.showPhoto && (
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-all">
                  <span>📁 {t('selectImageFile')}</span>
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
                      {t('removePhoto')}
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
          onNext={handleNextWrapper}
          onSave={handleSaveWrapper}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
          isAuthenticated={isAuthenticated}
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
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">{t('step2Header')}</h4>
        </div>

        {/* Form to add/edit a Work Experience */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">{editingExpIdx !== null ? "Edit Work Experience" : "Add New Work Experience"}</h5>
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
                  {t('currentlyWorkingHere')}
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
              {t('currentlyWorkingHere')}
            </label>
          </div>

          <Textarea
            rows={3}
            placeholder="Key accomplishments & bullet points (e.g. Led micro-frontend migration...)"
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            className="text-xs"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddExperience}
              disabled={!newExp.companyName || !newExp.jobTitle}
              className="text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
            >
              {editingExpIdx !== null ? (
                <>
                  <Pencil className="h-3.5 w-3.5" /> Update Experience
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add Experience
                </>
              )}
            </Button>
            {editingExpIdx !== null && (
              <Button size="sm" variant="ghost" onClick={handleCancelEditExperience} className="text-xs cursor-pointer">
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {/* Active List of Added Experiences */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Experiences ({safeExperiences.length})</label>
          {safeExperiences.map((exp: Experience, idx: number) => (
            <div key={idx} className={`p-3 rounded-xl bg-background border text-xs flex justify-between items-start gap-2 ${editingExpIdx === idx ? 'border-primary ring-1 ring-primary/30' : 'border-border/70'}`}>
              <div>
                <p className="font-bold text-foreground">{exp.jobTitle || exp.role} <span className="text-primary">@ {exp.companyName}</span></p>
                <p className="text-muted-foreground text-[11px]">
                  {formatDate(exp.startDate)} - {exp.endDate === "Present" || !exp.endDate ? "Present" : formatDate(exp.endDate)}
                </p>
                {exp.description && <p className="text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditExperience(idx)}
                  className="h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer"
                  title="Edit Experience"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveExperience(idx)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Delete Experience"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={handleNextWrapper}
          onSave={handleSaveWrapper}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
          isAuthenticated={isAuthenticated}
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
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">{t('step3Header')}</h4>
        </div>

        {/* Form to add/edit an Education entry */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">{editingEduIdx !== null ? "Edit Education Entry" : "Add New Education Entry"}</h5>
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
                  {t('currentlyStudyingHere')}
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
              {t('currentlyStudyingHere')}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddEducation}
              disabled={!newEdu.institutionName || !newEdu.degree}
              className="text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
            >
              {editingEduIdx !== null ? (
                <>
                  <Pencil className="h-3.5 w-3.5" /> Update Education
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add Education
                </>
              )}
            </Button>
            {editingEduIdx !== null && (
              <Button size="sm" variant="ghost" onClick={handleCancelEditEducation} className="text-xs cursor-pointer">
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {/* Active List of Added Educations */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Educations ({safeEducations.length})</label>
          {safeEducations.map((edu: Education, idx: number) => (
            <div key={idx} className={`p-3 rounded-xl bg-background border text-xs flex justify-between items-center ${editingEduIdx === idx ? 'border-primary ring-1 ring-primary/30' : 'border-border/70'}`}>
              <div>
                <p className="font-bold text-foreground">{edu.degree}</p>
                <p className="text-muted-foreground text-[11px]">
                  {edu.institutionName || edu.schoolName} • {formatDate(edu.startDate)} - {edu.endDate === "Present" || !edu.endDate ? "Present" : formatDate(edu.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditEducation(idx)}
                  className="h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer"
                  title="Edit Education"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveEducation(idx)}
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                  title="Delete Education"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={handleNextWrapper}
          onSave={handleSaveWrapper}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
          isAuthenticated={isAuthenticated}
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
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">{t('step4Header')}</h4>
        </div>

        {/* Form to add/edit a Project */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <h5 className="text-xs font-bold text-foreground">{editingProjIdx !== null ? "Edit Project" : "Add New Project"}</h5>
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddProject}
              disabled={!newProj.projectName}
              className="text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
            >
              {editingProjIdx !== null ? (
                <>
                  <Pencil className="h-3.5 w-3.5" /> Update Project
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add Project
                </>
              )}
            </Button>
            {editingProjIdx !== null && (
              <Button size="sm" variant="ghost" onClick={handleCancelEditProject} className="text-xs cursor-pointer">
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {/* Active List of Added Projects */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Added Projects ({safeProjects.length})</label>
          {safeProjects.map((proj: any, idx: number) => {
            const title = proj.title || proj.projectName || proj.projectTitle || "Untitled Project";
            const liveUrl = proj.links || proj.projectUrl || proj.url;
            const repoUrl = proj.repositoryUrl || proj.repoUrl;
            const techList = Array.isArray(proj.skills) && proj.skills.length > 0
              ? proj.skills
              : (proj.techologiesUsed || proj.technologies || '')
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter(Boolean);

            return (
              <div key={idx} className={`p-3 rounded-xl bg-background border text-xs flex justify-between items-start gap-2 ${editingProjIdx === idx ? 'border-primary ring-1 ring-primary/30' : 'border-border/70'}`}>
                <div>
                  <p className="font-bold text-foreground">{title}</p>
                  {proj.description && <p className="text-muted-foreground text-[11px] line-clamp-2">{proj.description}</p>}
                  
                  {/* Project Links & Tech tags */}
                  {(liveUrl || repoUrl) && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold">
                          <ExternalLink className="h-3 w-3" /> Live Demo
                        </a>
                      )}
                      {repoUrl && (
                        <a href={repoUrl} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground hover:underline flex items-center gap-1 font-semibold">
                          <FolderGit2 className="h-3 w-3" /> GitHub Repo
                        </a>
                      )}
                    </div>
                  )}

                  {techList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {techList.map((s: string, sIdx: number) => (
                        <span key={sIdx} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditProject(idx)}
                    className="h-7 w-7 text-primary hover:bg-primary/10 cursor-pointer"
                    title="Edit Project"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveProject(idx)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <StepNavigationFooter
          onPrev={onPrevStep}
          onNext={handleNextWrapper}
          onSave={handleSaveWrapper}
          isFirst={isFirstStep}
          isLast={isLastStep}
          isSaving={isSaving}
          isAuthenticated={isAuthenticated}
        />
      </div>
    );
  }

  // STEP 4: Skills, Languages & Summary (Safely handling array mapping without crash!)
  return (
    <div className="flex flex-col gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Wrench className="h-4 w-4 text-primary" />
        <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">{t('step5Header')}</h4>
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
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                onClick={handleAddLanguage}
                className="text-xs bg-primary text-primary-foreground font-bold cursor-pointer"
              >
                {editingLangIdx !== null ? (
                  <>
                    <Pencil className="h-3.5 w-3.5" /> Update
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Add
                  </>
                )}
              </Button>
              {editingLangIdx !== null && (
                <Button size="sm" variant="ghost" onClick={handleCancelEditLanguage} className="text-xs cursor-pointer">
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {safeLanguages.map((lang, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium text-foreground ${editingLangIdx === idx ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-muted border-border'}`}
              >
                <span>{lang}</span>
                <button
                  onClick={() => handleEditLanguage(idx)}
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title="Edit Language"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleRemoveLanguage(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Delete Language"
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
        onNext={handleNextWrapper}
        onSave={handleSaveWrapper}
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
  isAuthenticated?: boolean;
}

const StepNavigationFooter: React.FC<FooterProps> = ({
  onPrev,
  onNext,
  onSave,
  isFirst,
  isLast,
  isSaving,
  isAuthenticated,
}) => {
  const t = useTranslations("profileBuilder");
  return (
    <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
      <Button
        size="sm"
        variant="outline"
        onClick={onPrev}
        disabled={isFirst}
        className="text-xs gap-1 cursor-pointer"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> {t('btnPrevious')}
      </Button>

      <div className="flex items-center gap-2">
        {(isAuthenticated || isLast) && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onSave}
            disabled={isSaving}
            className="text-xs gap-1 font-bold cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> {t('btnSaveProfile')}
          </Button>
        )}

        {!isLast && (
          <Button
            size="sm"
            onClick={onNext}
            className="text-xs font-bold gap-1 bg-primary text-primary-foreground cursor-pointer"
          >
            {t('btnNext')} <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
