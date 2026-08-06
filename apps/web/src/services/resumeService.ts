import { ResumeDto, CreateResumeDto } from "@/types";
import { api } from "./apiClient";

/**
 * Fetch all resumes (sessions) owned by the current authenticated user.
 */
export const fetchResumes = async (
  token: string | undefined,
  page: number = 1,
  pageSize: number = 10
): Promise<ResumeDto[]> => {
  if (!token) return [];
  return api.get<ResumeDto[]>(`/resumes?page=${page}&pageSize=${pageSize}`, token).catch(() => []);
};

/**
 * Fetch a single resume session by ID.
 */
export const fetchResumeById = async (id: string, token: string | undefined): Promise<ResumeDto | null> => {
  if (!token) return null;
  return api.get<ResumeDto>(`/resumes/${id}`, token).catch(() => null);
};

/**
 * Generate a new resume session or create a new version of an existing session.
 */
export const generateResume = async (
  data: CreateResumeDto,
  token: string | undefined
): Promise<ResumeDto | null> => {
  if (!token) return null;
  return api.post<ResumeDto>("/resumes/generate", data, token).catch(() => null);
};

/**
 * Delete a resume session by ID.
 */
export const deleteResume = async (id: string, token: string | undefined): Promise<boolean> => {
  if (!token) return false;
  return api.delete<void>(`/resumes/${id}`, token)
    .then(() => true)
    .catch(() => false);
};

/**
 * Update a specific resume translation (summary, section HTMLs, title).
 */
export const updateResumeTranslation = async (
  resumeId: string,
  translationId: number | string,
  data: {
    title?: string;
    summary?: string;
    experienceHtml?: string;
    educationHtml?: string;
    skillsHtml?: string;
    languagesHtml?: string;
    projectsHtml?: string | null;
    coverLetter?: string | null;
    coldMessage?: string | null;
  },
  token: string | undefined
): Promise<boolean> => {
  if (!token) return false;
  return api.put<any>(`/resumes/${resumeId}/translations/${translationId}`, data, token)
    .then(() => true)
    .catch(() => false);
};

/**
 * Perform standalone real-time ATS Analysis (Quick Scan).
 */
export const analyzeAts = async (
  data: { externalJobLink: string; profileId: string; jobDescriptionText?: string },
  token: string | undefined
) => {
  if (!token) return null;
  return api.post<import("@/types").AtsAnalysisResultDto>("/resumes/ats-analyze", data, token).catch(() => null);
};
