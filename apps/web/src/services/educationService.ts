import { Education, CreateEducationDto } from "@/types";
import { api } from "./apiClient";

export const fetchEducations = async (token: string | undefined): Promise<Education[]> => {
    if (!token) return [];
    return api.get<Education[]>("/education", token).catch(() => []);
};

export const createEducation = async (
    data: CreateEducationDto,
    token: string | undefined
): Promise<Education | null> => {
    if (!token) return null;
    return api.post<Education>("/education", data, token).catch(() => null);
};

export const updateEducation = async (
    id: string,
    data: CreateEducationDto,
    token: string | undefined
): Promise<Education | null> => {
    if (!token) return null;
    return api.put<Education>(`/education/${id}`, data, token).catch(() => null);
};

export const deleteEducation = async (id: string, token: string | undefined): Promise<boolean> => {
    if (!token) return false;
    return api.delete(`/education/${id}`, token)
        .then(() => true)
        .catch(() => false);
};
