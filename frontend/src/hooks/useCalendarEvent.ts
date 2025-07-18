import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";

export function useCalendarEvent(eventId?: string) {
  return useQuery({
    queryKey: ["calendarEvent", eventId],
    queryFn: () => trpcClient.calendarEvents.view.query({ eventId: eventId! }),
    enabled: !!eventId,
  });
}
