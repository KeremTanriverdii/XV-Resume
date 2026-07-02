import { Project, CreateProjectDto } from "@/types";
import { api } from "./apiClient";

export const fetchProjects = async (token: string | undefined): Promise<Project[]> => {
    if (!token) return [];
    return api.get<Project[]>("/projects", token).catch(() => []);
};

export const createProject = async (
    data: CreateProjectDto,
    token: string | undefined
): Promise<Project | null> => {
    if (!token) return null;
    return api.post<Project>("/projects", data, token).catch(() => null);
};

export const updateProject = async (
    id: string,
    data: CreateProjectDto,
    token: string | undefined
): Promise<Project | null> => {
    if (!token) return null;
    return api.put<Project>(`/projects/${id}`, data, token).catch(() => null);
};

export const deleteProject = async (id: string, token: string | undefined): Promise<boolean> => {
    if (!token) return false;
    return api.delete(`/projects/${id}`, token)
        .then(() => true)
        .catch(() => false);
};
