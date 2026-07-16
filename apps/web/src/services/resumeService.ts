import { ResumeDto, CreateResumeDto } from "@/types";
import { api } from "./apiClient";

/**
 * Fetch all resumes (sessions) owned by the current authenticated user.
 */
export const fetchResumes = async (token: string | undefined): Promise<ResumeDto[]> => {
  if (!token) return [];
  return api.get<ResumeDto[]>("/resumes", token).catch(() => []);
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
