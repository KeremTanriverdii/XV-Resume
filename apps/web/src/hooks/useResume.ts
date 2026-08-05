import { fetchResumes, generateResume, deleteResume } from "@/services/resumeService";
import { ResumeDto, CreateResumeDto } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const resumeKeys = {
  all: ['resumes'] as const,
  list: (token?: string) => [...resumeKeys.all, token] as const,
};

export function useResumes(token: string | undefined) {
  return useQuery<ResumeDto[], Error>({
    queryKey: resumeKeys.all,
    queryFn: () => fetchResumes(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
  });
}

export function useGenerateResume() {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeDto | null,
    Error,
    { data: CreateResumeDto; token: string }
  >({
    mutationFn: ({ data, token }) => generateResume(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    { id: string; token: string }
  >({
    mutationFn: ({ id, token }) => deleteResume(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}
