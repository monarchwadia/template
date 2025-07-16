import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useCommunityList() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: () => trpcClient.community.list.query(),
  });
}
