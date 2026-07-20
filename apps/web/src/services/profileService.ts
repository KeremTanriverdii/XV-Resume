import { Profile, CreateProfileDto } from "@/types";
import { api } from "./apiClient";


export const fetchProfiles = async (token: string | undefined): Promise<Profile[]> => {
    if (!token) return [];
    return api.get<Profile[]>("/profiles", token).catch(() => []);
};

export const fetchProfile = async (token: string | undefined): Promise<Profile | null> => {
    const profiles = await fetchProfiles(token);
    return profiles.length > 0 ? profiles[0] : null;
};

export const createProfile = async (
    data: CreateProfileDto,
    token: string | undefined
): Promise<Profile | null> => {
    if (!token) return null;
    return api.post<Profile>("/profiles", data, token).catch(() => null);
};

export const updateProfile = async (
    id: string,
    data: CreateProfileDto,
    token: string | undefined
): Promise<Profile | null> => {
    if (!token) return null;
    return api.put<Profile>(`/profiles/${id}`, data, token).catch(() => null);
};

export const deleteProfile = async (
    id: string,
    token: string | undefined
): Promise<boolean> => {
    if (!token) return false;
    return api.delete(`/profiles/${id}`, token).then(() => true).catch(() => false);
};
