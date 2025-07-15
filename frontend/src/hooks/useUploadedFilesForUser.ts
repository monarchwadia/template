import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';
import { queryClient } from '../clients/reactQueryClient';

const buildQueryKey = (userId: string | undefined) => ['uploaded-files', userId];

export function useUploadedFilesForUser(userId: string | undefined) {
  return useQuery({
    queryKey: buildQueryKey(userId),
    queryFn: async () => {
      if (!userId) return [];
      return await trpcClient.fileManagement.getAssetsForUser.query({ userId });
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function invalidateUploadedFilesForUser(userId: string | undefined) {
  if (!userId) return;
  queryClient.invalidateQueries({ queryKey: buildQueryKey(userId) });
}
