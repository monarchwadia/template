import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useCommunity(slug?: string) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: () => trpcClient.community.get.query({ slug: slug! }),
    enabled: !!slug,
  });
}
