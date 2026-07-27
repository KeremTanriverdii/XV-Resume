import { ResumeDto, ResumeTranslationDto } from "@/types";

const DRAFT_CV_KEY = "resumex_guest_cv_draft";
const DRAFT_LANG_KEY = "resumex_guest_lang_draft";

export const DEFAULT_GUEST_CV: any = {
  templateId: "modern",
  colorTheme: "blue",
  profile: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    photoUrl: "",
    socialLinks: [],
    showPhoto: false,
    militaryStatus: "None",
  } as any,
};

export const DEFAULT_GUEST_TRANSLATION: Partial<ResumeTranslationDto> = {
  languageCode: "en",
  title: "Untitled Resume",
  summary: "",
  experienceHtml: "",
  educationHtml: "",
  skillsHtml: "",
  projectsHtml: "",
  languagesHtml: "",
};

export function saveGuestDraft(resume: Partial<ResumeDto>, translation: Partial<ResumeTranslationDto>) {
  if (typeof window === "undefined") return;
  try {
    const data = { resume, translation, updatedAt: Date.now() };
    localStorage.setItem(DRAFT_CV_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save guest CV draft to localStorage", err);
  }
}

export function loadGuestDraft(): { resume: Partial<ResumeDto>; translation: Partial<ResumeTranslationDto> } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_CV_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load guest CV draft from localStorage", err);
    return null;
  }
}

export function clearGuestDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_CV_KEY);
}
