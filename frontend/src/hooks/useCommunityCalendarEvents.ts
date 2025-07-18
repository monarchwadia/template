import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";

export function useCommunityCalendarEvents(slug?: string) {
  return useQuery({
    queryKey: ["calendarEvents", slug],
    queryFn: () =>
      slug
        ? trpcClient.calendarEvents.list.query({ slug: slug })
        : Promise.resolve([]),
    enabled: !!slug,
  });
}
