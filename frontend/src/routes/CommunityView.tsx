
import { useParams } from "react-router-dom";
import { useCommunity } from "../hooks/useCommunityPublic";
import { useCommunityCalendarEvents } from "../hooks/useCommunityCalendarEvents";
import { HiUserGroup, HiUserCircle, HiStar } from "react-icons/hi2";
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function CommunityView() {
  const { slug } = useParams();
  const { data, isLoading, error } = useCommunity(slug);

  let statusIcon = <HiUserGroup className="inline w-5 h-5 text-base-content/40 mr-1" title="Public" />;
  let statusText = "Public";
  if (data?.isOwner) {
    statusIcon = <HiStar className="inline w-5 h-5 text-warning mr-1" title="Owner" />;
    statusText = "You are the owner";
  } else if (data?.isMember) {
    statusIcon = <HiUserCircle className="inline w-5 h-5 text-success mr-1" title="Member" />;
    statusText = "You are a member";
  }

  const memberCount = data?.privateCommunityProfile?.numberOfMembers;

  // Get communityId for calendar events
  const communityId = data?.publicCommunityProfile?.id;
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useCommunityCalendarEvents(communityId);

  return (
    <div className="container mx-auto py-8">
      {isLoading && <div className="loading loading-spinner loading-md" />}
      {error && <div className="alert alert-error">Error loading community.</div>}
      {!isLoading && !error && !data && (
        <div className="alert alert-info">Community not found.</div>
      )}
      {data && (
        <>
          <div className="card bg-base-100 shadow p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              {statusIcon}
              <h1 className="text-3xl font-bold mb-0">{data.publicCommunityProfile.name}</h1>
            </div>
            <div className="text-base-content/60 text-sm mb-4 flex items-center gap-2">
              <span>Slug: {data.publicCommunityProfile.slug}</span>
              <span className="ml-4">{statusText}</span>
              {typeof memberCount === 'number' && (
                <span className="ml-4">Members: {memberCount}</span>
              )}
            </div>
            <div className="mb-4">
              {data.publicCommunityProfile.description || (
                <span className="italic text-base-content/40">No description</span>
              )}
            </div>
            <div className="text-xs text-base-content/40">
              Created: {new Date(data.publicCommunityProfile.createdAt).toLocaleDateString()}
              <br />
              Last updated: {new Date(data.publicCommunityProfile.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <HiOutlineCalendar className="inline w-6 h-6 text-primary" />
              Upcoming Events
            </h2>
            {eventsLoading && <div className="loading loading-spinner loading-md" />}
            {eventsError && <div className="alert alert-error">Error loading events.</div>}
            {!eventsLoading && !eventsError && eventsData && eventsData.length === 0 && (
              <div className="alert alert-info">No upcoming events.</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData && eventsData.map(event => (
                <div key={event.id} className="card bg-base-200 shadow border border-base-300">
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-primary badge-outline text-xs font-semibold">
                        {event.publishedAt ? "Published" : "Draft"}
                      </span>
                      {event.cancelledAt && (
                        <span className="badge badge-error badge-outline text-xs font-semibold">Cancelled</span>
                      )}
                    </div>
                    <h3 className="card-title text-lg mb-1 flex items-center gap-2">
                      <HiOutlineCalendar className="inline w-5 h-5 text-primary" />
                      {event.title}
                    </h3>
                    {event.desc && <p className="mb-2 text-base-content/80">{event.desc}</p>}
                    <div className="flex flex-wrap gap-2 text-sm mb-2">
                      <span className="flex items-center gap-1">
                        <HiOutlineClock className="inline w-4 h-4 text-base-content/60" />
                        {new Date(event.startDt).toLocaleString()} - {new Date(event.endDt).toLocaleString()}
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
          </div>
        </>
      )}
    </div>
  );
}
