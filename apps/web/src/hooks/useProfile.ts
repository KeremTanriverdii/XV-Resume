import { fetchProfiles, createProfile, updateProfile } from "@/services/profileService";
import { Profile, CreateProfileDto } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const profileKeys = {
    all: ['profiles'] as const,
    list: (token?: string) => ['profiles', 'list', token] as const,
};

export function useProfiles(token: string | undefined) {
    return useQuery<Profile[], Error>({
        queryKey: profileKeys.list(token),
        queryFn: () => fetchProfiles(token!),
        enabled: !!token,
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
        refetchOnWindowFocus: false, // Prevents background re-fetching when switching tabs
    });
}

export function useCreateProfile() {
    const queryClient = useQueryClient();
    return useMutation<Profile | null, Error, { profileData: CreateProfileDto | any; token: string }>({
        mutationFn: ({ profileData, token }) => createProfile(profileData as any, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation<Profile | null, Error, { id: string; profileData: CreateProfileDto | any; token: string }>({
        mutationFn: ({ id, profileData, token }) => updateProfile(id, profileData as any, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
}
