import { fetchResumes, fetchResumeById, generateResume, deleteResume } from "@/services/resumeService";
import { ResumeDto, CreateResumeDto } from "@/types";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const resumeKeys = {
  all: ['resumes'] as const,
  list: (token?: string) => ['resumes', 'list', token] as const,
  infinite: (token?: string) => ['resumes', 'infinite', token] as const,
  detail: (id?: string) => ['resumes', 'detail', id] as const,
};

/**
 * Fetch all resume sessions owned by the current user.
 * Caches the array of ResumeDto objects.
 */
export function useResumes(token: string | undefined) {
  return useQuery<ResumeDto[], Error>({
    queryKey: resumeKeys.list(token),
    queryFn: () => fetchResumes(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Prevents background re-fetching when switching tabs
  });
}

/**
 * Fetch resume sessions with infinite scrolling / pagination.
 */
export function useInfiniteResumes(token: string | undefined, pageSize = 10) {
  return useInfiniteQuery<ResumeDto[], Error>({
    queryKey: resumeKeys.infinite(token),
    queryFn: ({ pageParam = 1 }) => fetchResumes(token!, pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single resume session by ID.
 * Caches the detailed ResumeDto object (with all translations, sections, job link).
 */
export function useResumeSession(id: string | undefined, token: string | undefined) {
  return useQuery<ResumeDto | null, Error>({
    queryKey: resumeKeys.detail(id),
    queryFn: () => fetchResumeById(id!, token!),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Prevents background re-fetching when switching tabs
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
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
      if (newResume?.id) {
        queryClient.setQueryData(resumeKeys.detail(newResume.id), newResume);
      }
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
      queryClient.removeQueries({ queryKey: resumeKeys.detail(id) });
    },
  });
}
