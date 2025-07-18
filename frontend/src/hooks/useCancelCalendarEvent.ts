import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";

export function useCancelCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return trpcClient.calendarEvents.cancel.mutate({ eventId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvent", data.id] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}
