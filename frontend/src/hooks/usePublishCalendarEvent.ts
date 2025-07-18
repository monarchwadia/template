import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";

export function usePublishCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return trpcClient.calendarEvents.publish.mutate({ eventId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvent", data.id] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}

export function useUnpublishCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      return trpcClient.calendarEvents.unpublish.mutate({ eventId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvent", data.id] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
    },
  });
}
