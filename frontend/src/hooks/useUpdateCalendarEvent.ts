import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      eventId: string;
      title?: string;
      desc?: string;
      location?: string;
      startDt?: string;
      endDt?: string;
      timezone?: string;
    }) => {
      return trpcClient.calendarEvents.update.mutate(data);
    },
    onSuccess: (data) => {
      // Invalidate and refetch the specific event
      queryClient.invalidateQueries({ queryKey: ["calendarEvent", data.id] });
      // Also invalidate the events list for the community
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}
