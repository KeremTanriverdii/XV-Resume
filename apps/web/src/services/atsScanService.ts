import { AtsScanDto } from "@/types";
import { api } from "./apiClient";

export const fetchAtsScans = async (
  token: string | undefined,
  page: number = 1,
  pageSize: number = 10
): Promise<AtsScanDto[]> => {
  if (!token) return [];
  return api.get<AtsScanDto[]>(`/ats-scans?page=${page}&pageSize=${pageSize}`, token).catch(() => []);
};

export const fetchAtsScanById = async (
  id: string,
  token: string | undefined
): Promise<AtsScanDto | null> => {
  if (!token) return null;
  return api.get<AtsScanDto>(`/ats-scans/${id}`, token).catch(() => null);
};

export const createAtsScan = async (
  data: { externalJobLink: string; profileId: string; jobDescriptionText?: string },
  token: string | undefined
): Promise<AtsScanDto | null> => {
  if (!token) return null;
  return api.post<AtsScanDto>("/ats-scans", data, token).catch(() => null);
};

export const deleteAtsScan = async (
  id: string,
  token: string | undefined
): Promise<boolean> => {
  if (!token) return false;
  return api.delete<void>(`/ats-scans/${id}`, token)
    .then(() => true)
    .catch(() => false);
};
