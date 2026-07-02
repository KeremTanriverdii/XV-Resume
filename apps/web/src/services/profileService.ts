import { Profile, CreateProfileDto } from "@/types";
import { api } from "./apiClient";

export const fetchProfile = async (token: string | undefined): Promise<Profile | null> => {
    if (!token) return null;
    return api.get<Profile>("/profiles", token).catch(() => null);
};

export const createProfile = async (
    data: CreateProfileDto,
    token: string | undefined
): Promise<Profile | null> => {
    if (!token) return null;
    return api.post<Profile>("/profiles", data, token).catch(() => null);
};
