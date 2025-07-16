import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useCommunityPublic(slug?: string) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: () => trpcClient.community.getPublic.query({ slug: slug! }),
    enabled: !!slug,
  });
}
