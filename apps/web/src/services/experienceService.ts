import { Experience, CreateExperienceDto } from "@/types";
import { api } from "./apiClient";

export const fetchExperiences = async (token: string | undefined): Promise<Experience[]> => {
    if (!token) return [];
    return api.get<Experience[]>("/experience", token).catch(() => []);
};

export const createExperience = async (
    data: CreateExperienceDto,
    token: string | undefined
): Promise<Experience | null> => {
    if (!token) return null;
    return api.post<Experience>("/experience", data, token).catch(() => null);
};

export const updateExperience = async (
    id: string,
    data: CreateExperienceDto,
    token: string | undefined
): Promise<Experience | null> => {
    if (!token) return null;
    return api.put<Experience>(`/experience/${id}`, data, token).catch(() => null);
};

export const deleteExperience = async (id: string, token: string | undefined): Promise<boolean> => {
    if (!token) return false;
    return api.delete(`/experience/${id}`, token)
        .then(() => true)
        .catch(() => false);
};
