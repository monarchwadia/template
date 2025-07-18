import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { useCommunityCalendarEvents } from "../hooks/useCommunityCalendarEvents";
import { JoinCommunityNotice } from "../routes/JoinCommunityNotice";

interface CommunityEventsListProps {
  slug: string;
  isOwner?: boolean;
  isMember?: boolean;
}

export function CommunityEventsList({
  slug,
  isOwner,
  isMember,
}: CommunityEventsListProps) {
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useCommunityCalendarEvents(slug);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <HiOutlineCalendar className="inline w-6 h-6 text-primary" />
        Upcoming Events
      </h2>
      {!(isOwner || isMember) ? (
        <JoinCommunityNotice slug={slug} />
      ) : (
        <>
          {eventsLoading && (
            <div className="loading loading-spinner loading-md" />
          )}
          {eventsError && (
            <div className="alert alert-error">Error loading events.</div>
          )}
          {!eventsLoading &&
            !eventsError &&
            eventsData &&
            eventsData.length === 0 && (
              <div className="alert alert-info">No upcoming events.</div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsData &&
              eventsData.map((event) => (
                <div
                  key={event.id}
                  className="card bg-base-200 shadow border border-base-300"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-primary badge-outline text-xs font-semibold">
                        {event.publishedAt ? "Published" : "Draft"}
                      </span>
                      {event.cancelledAt && (
                        <span className="badge badge-error badge-outline text-xs font-semibold">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <h3 className="card-title text-lg mb-1 flex items-center gap-2">
                      <HiOutlineCalendar className="inline w-5 h-5 text-primary" />
                      <Link
                        to={`/c/${slug}/events/${event.id}`}
                        className="link link-primary hover:link-accent"
                      >
                        {event.title}
                      </Link>
                    </h3>
                    {event.desc && (
                      <p className="mb-2 text-base-content/80">{event.desc}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                      <span className="flex items-center gap-1">
                        <HiOutlineClock className="inline w-4 h-4 text-base-content/60" />
                        {new Date(event.startDt).toLocaleString()} -{" "}
                        {new Date(event.endDt).toLocaleString()}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <HiOutlineLocationMarker className="inline w-4 h-4 text-base-content/60" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {event.publishedAt ? (
                        <span className="badge badge-success badge-outline flex items-center gap-1">
                          <HiOutlineEye className="inline w-4 h-4" /> Visible
                        </span>
                      ) : (
                        <span className="badge badge-ghost flex items-center gap-1">
                          <HiOutlineEyeOff className="inline w-4 h-4" /> Hidden
                        </span>
                      )}
                      {event.cancelledAt && (
                        <span className="badge badge-error badge-outline flex items-center gap-1">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
