import { fetchAtsScans, fetchAtsScanById, createAtsScan, deleteAtsScan } from "@/services/atsScanService";
import { AtsScanDto } from "@/types";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const atsScanKeys = {
  all: ['atsScans'] as const,
  list: (token?: string) => ['atsScans', 'list', token] as const,
  infinite: (token?: string) => ['atsScans', 'infinite', token] as const,
  detail: (id?: string) => ['atsScans', 'detail', id] as const,
};

export function useInfiniteAtsScans(token: string | undefined, pageSize = 10) {
  return useInfiniteQuery<AtsScanDto[], Error>({
    queryKey: atsScanKeys.infinite(token),
    queryFn: ({ pageParam = 1 }) => fetchAtsScans(token!, pageParam as number, pageSize),
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

export function useAtsScan(id: string | undefined, token: string | undefined) {
  return useQuery<AtsScanDto | null, Error>({
    queryKey: atsScanKeys.detail(id),
    queryFn: () => fetchAtsScanById(id!, token!),
    enabled: !!token && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateAtsScan() {
  const queryClient = useQueryClient();
  return useMutation<
    AtsScanDto | null,
    Error,
    { data: { externalJobLink: string; profileId: string; jobDescriptionText?: string }; token: string }
  >({
    mutationFn: ({ data, token }) => createAtsScan(data, token),
    onSuccess: (newScan) => {
      queryClient.invalidateQueries({ queryKey: atsScanKeys.all });
      if (newScan?.id) {
        queryClient.setQueryData(atsScanKeys.detail(newScan.id), newScan);
      }
    },
  });
}

export function useDeleteAtsScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) => deleteAtsScan(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: atsScanKeys.all });
    },
  });
}
