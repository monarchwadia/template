import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useCommunityCalendarEvents(communityId?: string) {
  return useQuery({
    queryKey: ['calendarEvents', communityId],
    queryFn: () => trpcClient.calendarEvents.list.query({ communityId }),
    enabled: !!communityId,
  });
}
