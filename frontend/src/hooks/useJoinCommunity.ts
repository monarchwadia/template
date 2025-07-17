import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      return trpcClient.community.join.mutate({ slug });
    },
    onSuccess: (_data, slug) => {
      // Invalidate the community query so membership status updates
      queryClient.invalidateQueries({ queryKey: ['community', slug] });
    },
  });
}
