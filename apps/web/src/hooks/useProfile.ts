import { fetchProfiles } from "@/services/profileService"
import { Profile } from "@/types"
import { useQuery } from "@tanstack/react-query"

export const profileKeys = {
    all: ['profiles'] as const,
    profiles: (userId: string) => [...profileKeys.all, userId] as const,
}
export function useProfiles(token:string){
    return useQuery<Profile[],Error>({
        queryKey:profileKeys.all,
        queryFn: () => fetchProfiles(token),
        enabled: !!token,
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
    });
}

