import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
};

export type Languages = "en" | "tr" | "de" | "es" | "jp" | "fr";

// --- EDUCATION TYPES ---
export interface Education {
  id: string;
  profileId?: string;
  schoolName: string;
  institutionName?: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string | null;
  isOngoing?: boolean;
  gpa?: string | null;
}

export interface CreateEducationDto {
  schoolName: string;
  institutionName?: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string | null;
  isOngoing?: boolean;
  gpa?: string | null;
}

// --- EXPERIENCE TYPES ---
export interface Experience {
  id: string;
  profileId?: string;
  companyName: string;
  role: string;
  jobTitle?: string;
  startDate: string;
  endDate: string | null;
  isOngoing?: boolean;
  description: string;
  logoUrl?: string;
  location?: string;
}

export interface CreateExperienceDto {
  profileId?: string;
  companyName: string;
  role: string;
  jobTitle?: string;
  startDate: string;
  endDate: string | null;
  isOngoing?: boolean;
  description: string;
  logoUrl?: string;
  location?: string;
}

// --- PROJECT TYPES ---
export interface Project {
  id: string;
  userId?: string;
  title: string;
  projectName?: string;
  description: string;
  techologiesUsed?: string;
  skills?: string[];
  projectUrl?: string;
  links?: string;
  repositoryUrl?: string;
  repoUrl?: string;
}

export interface CreateProjectDto {
  title: string;
  projectName?: string;
  description: string;
  techologiesUsed?: string;
  skills?: string[];
  projectUrl?: string;
  links?: string;
  repositoryUrl?: string;
  repoUrl?: string;
}

export type MilitaryStatus = "None" | "Default" | "Completed" | "Postponed" | "Exempt" | "Tecilli" | "Yapıldı" | string;

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  choosedLanguage: string;
  country: string;
  phone: string;
  districtAndCityLocation: string;
  militaryStatus: MilitaryStatus;
  militaryPostponedUntil: string | null;
}

export interface UserUpdateDto {
  choosedLanguage: string;
  fullname: string;
  phone: string;
  districtAndCityLocation: string;
  militaryStatus: MilitaryStatus;
  militaryPostponedUntil: string | null;
}

// --- PROFILE TYPES ---
export interface Profile {
  id: string;
  userId?: string;
  profileName: string;
  fullName: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  experienceJson: string;
  educationJson: string;
  skills: string[];
  socialLinks: string[];
  photoUrl?: string;
  showPhoto: boolean;
  createdAt: string;
  location?: string;
  languages: string[];
  militaryStatus: MilitaryStatus;
  militaryPostponedUntil: string | null;
  projects?: Project[];
  educations?: Education[];
  experiences?: Experience[];
}

export interface CreateProfileDto {
  profileName: string;
  fullName: string;
  title?: string;
  summary?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  socialLinks?: string[];
  photoUrl?: string;
  showPhoto?: boolean;
  location?: string;
  languages?: string[];
  militaryStatus?: MilitaryStatus;
  militaryPostponedUntil?: string | null;
}

// --- RESUME TYPES ---
export interface CreateResumeDto {
  externalJobLink: string;
  profileId?: string | null;
  selectedLanguagesForGeneration?: string[];
  resumeId?: string | null;
}

export interface ResumeTranslationDto {
  id: number | string;
  resumeId: string;
  languageCode: string;
  title: string;
  summary: string;
  experienceHtml: string;
  educationHtml: string;
  skillsHtml: string;
  languagesHtml: string;
  projectsHtml?: string | null;
  matchPercentage?: number | null;
  atsFeedback?: string | null;
  version: number;
  createdAt: string;
}

export interface ResumeDto {
  id: string;
  profileId?: string | null;
  externalJobLink: string;
  jobDescription: string;
  createdAt: string;
  translations: ResumeTranslationDto[];
  profile?: Profile | null;
}

export interface AtsAnalysisRequestDto {
  externalJobLink: string;
  profileId: string;
  jobDescriptionText?: string;
}

export interface AtsAnalysisResultDto {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  atsFeedback: string;
  scrapedJobTitle: string;
  scrapedJobDescription: string;
}

export * from "./landing";


