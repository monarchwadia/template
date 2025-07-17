import { useMutation } from '@tanstack/react-query';
import { trpcClient } from '../clients/trpcClient';

export function useCreateCommunityEvent() {
  return useMutation({
    mutationFn: async (input: {
      slug: string;
      title: string;
      desc?: string;
      location?: string;
      startDt: string;
      endDt: string;
      timezone: string;
    }) => {
      return trpcClient.calendarEvents.create.mutate(input);
    },
  });
}
