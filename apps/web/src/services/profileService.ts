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
