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
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  gpa: string | null;
}

export interface CreateEducationDto {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  gpa: string | null;
}

// --- EXPERIENCE TYPES ---
export interface Experience {
  id: string;
  profileId?: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  description: string;
  logoUrl?: string;
  location?: string;
}

export interface CreateExperienceDto {
  profileId?: string;
  companyName: string;
  role: string;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  description: string;
  logoUrl?: string;
  location?: string;
}

// --- PROJECT TYPES ---
export interface Project {
  id: string;
  userId?: string;
  title: string;
  description: string;
  techologiesUsed?: string;
  links?: string;
  repositoryUrl?: string;
}

export interface CreateProjectDto {
  title: string;
  description: string;
  techologiesUsed?: string;
  links?: string;
  repositoryUrl?: string;
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
}
