import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCommunity } from "../hooks/useCommunityPublic";
import { useCalendarEvent } from "../hooks/useCalendarEvent";
import {
  usePublishCalendarEvent,
  useUnpublishCalendarEvent,
} from "../hooks/usePublishCalendarEvent";
import { useCancelCalendarEvent } from "../hooks/useCancelCalendarEvent";
import { JoinCommunityNotice } from "./JoinCommunityNotice";
import { EditEventForm } from "../components/EditEventForm";
import { ConfirmModal } from "../components/ConfirmModal";
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiArrowLeft,
  HiPencil,
  HiX,
} from "react-icons/hi";

export default function EventView() {
  const { slug, eventId } = useParams();
  const navigate = useNavigate();
  const {
    data: communityData,
    isLoading: communityLoading,
    error: communityError,
  } = useCommunity(slug);
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useCalendarEvent(eventId);
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const publishMutation = usePublishCalendarEvent();
  const unpublishMutation = useUnpublishCalendarEvent();
  const cancelMutation = useCancelCalendarEvent();

  // Check if current user is the owner of the community
  const isOwner = communityData?.isOwner;

  const handlePublish = () => {
    if (!event?.id) return;
    publishMutation.mutate(event.id);
  };

  const handleUnpublish = () => {
    if (!event?.id) return;
    unpublishMutation.mutate(event.id);
  };

  const handleCancel = () => {
    if (!event?.id) return;
    cancelMutation.mutate(event.id);
    setShowCancelModal(false);
  };

  // If user hasn't joined the community, show join notice
  if (
    !communityLoading &&
    !communityError &&
    communityData &&
    !(communityData.isOwner || communityData.isMember)
  ) {
    return (
      <div className="container mx-auto py-8">
        <div className="card bg-base-100 shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-4">Event Access Restricted</h1>
          <p className="mb-4">
            You need to join this community to view its events.
          </p>
          <JoinCommunityNotice
            slug={communityData.publicCommunityProfile.slug}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {(communityLoading || eventLoading) && (
        <div className="loading loading-spinner loading-md" />
      )}
      {(communityError || eventError) && (
        <div className="alert alert-error">
          Error loading {communityError ? "community" : "event"}:{" "}
          {(communityError || eventError)?.message}
        </div>
      )}
      {!communityLoading && !communityError && !communityData && (
        <div className="alert alert-info">Community not found.</div>
      )}
      {!eventLoading && !eventError && !event && (
        <div className="alert alert-info">Event not found.</div>
      )}
      {communityData &&
        (communityData.isOwner || communityData.isMember) &&
        event && (
          <>
            {/* Back to Community Button */}
            <div className="mb-6">
              <button
                className="btn btn-ghost gap-2"
                onClick={() => navigate(`/c/${slug}`)}
              >
                <HiArrowLeft className="w-4 h-4" />
                Back to {communityData.publicCommunityProfile.name}
              </button>
            </div>

            {/* Event Details Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Event Status Badges and Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-outline text-xs font-semibold">
                      {event.publishedAt ? "Published" : "Draft"}
                    </span>
                    {event.cancelledAt && (
                      <span className="badge badge-error badge-outline text-xs font-semibold">
                        Cancelled
                      </span>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2">
                      {/* Cancel Event Button (only for non-cancelled events) */}
                      {!event.cancelledAt && (
                        <button
                          className="btn btn-error btn-sm gap-2"
                          onClick={() => setShowCancelModal(true)}
                          disabled={cancelMutation.isPending}
                        >
                          <HiX className="w-4 h-4" />
                          Cancel Event
                        </button>
                      )}
                      {/* Publish/Unpublish Button */}
                      {event.publishedAt ? (
                        <button
                          className="btn btn-warning btn-sm gap-2"
                          onClick={handleUnpublish}
                          disabled={unpublishMutation.isPending}
                        >
                          <HiOutlineEyeOff className="w-4 h-4" />
                          {unpublishMutation.isPending
                            ? "Unpublishing..."
                            : "Unpublish"}
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm gap-2"
                          onClick={handlePublish}
                          disabled={publishMutation.isPending}
                        >
                          <HiOutlineEye className="w-4 h-4" />
                          {publishMutation.isPending
                            ? "Publishing..."
                            : "Publish"}
                        </button>
                      )}
                      {/* Edit Button */}
                      <button
                        className="btn btn-primary btn-sm gap-2"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <HiPencil className="w-4 h-4" />
                        {isEditing ? "Cancel Edit" : "Edit Event"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Form or Event Display */}
                {isEditing && isOwner ? (
                  <EditEventForm
                    event={event}
                    onCancel={() => setIsEditing(false)}
                    onSuccess={() => setIsEditing(false)}
                  />
                ) : (
                  <>
                    {/* Event Title */}
                    <h1 className="card-title text-3xl mb-6 flex items-center gap-3">
                      <HiOutlineCalendar className="w-8 h-8 text-primary" />
                      {event.title}
                    </h1>

                    {/* Event Description */}
                    {event.desc && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">
                          Description
                        </h3>
                        <p className="text-base-content/80 whitespace-pre-wrap">
                          {event.desc}
                        </p>
                      </div>
                    )}

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Date and Time */}
                      <div className="card bg-base-200 shadow">
                        <div className="card-body">
                          <h3 className="card-title text-lg flex items-center gap-2">
                            <HiOutlineClock className="w-5 h-5 text-primary" />
                            Date & Time
                          </h3>
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold">Start:</span>{" "}
                              {new Date(event.startDt).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-semibold">End:</span>{" "}
                              {new Date(event.endDt).toLocaleString()}
                            </div>
                            {event.timezone && (
                              <div>
                                <span className="font-semibold">Timezone:</span>{" "}
                                {event.timezone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="card bg-base-200 shadow">
                        <div className="card-body">
                          <h3 className="card-title text-lg flex items-center gap-2">
                            <HiOutlineLocationMarker className="w-5 h-5 text-primary" />
                            Location
                          </h3>
                          <div>
                            {event.location ? (
                              <span>{event.location}</span>
                            ) : (
                              <span className="italic text-base-content/60">
                                No location specified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Visibility */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Visibility:</span>
                        {event.publishedAt ? (
                          <span className="badge badge-success badge-outline flex items-center gap-1">
                            <HiOutlineEye className="w-4 h-4" /> Public
                          </span>
                        ) : (
                          <span className="badge badge-ghost flex items-center gap-1">
                            <HiOutlineEyeOff className="w-4 h-4" /> Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Event Timestamps */}
                    <div className="text-xs text-base-content/40 mt-6 border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">Created:</span>{" "}
                          {new Date(event.createdAt).toLocaleString()}
                        </div>
                        <div>
                          <span className="font-semibold">Updated:</span>{" "}
                          {new Date(event.updatedAt).toLocaleString()}
                        </div>
                        {event.publishedAt && (
                          <div>
                            <span className="font-semibold">Published:</span>{" "}
                            {new Date(event.publishedAt).toLocaleString()}
                          </div>
                        )}
                        {event.cancelledAt && (
                          <div>
                            <span className="font-semibold">Cancelled:</span>{" "}
                            {new Date(event.cancelledAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Error Messages */}
                {publishMutation.error && (
                  <div className="alert alert-error mt-4">
                    Error publishing event: {publishMutation.error.message}
                  </div>
                )}
                {unpublishMutation.error && (
                  <div className="alert alert-error mt-4">
                    Error unpublishing event: {unpublishMutation.error.message}
                  </div>
                )}
                {cancelMutation.error && (
                  <div className="alert alert-error mt-4">
                    Error cancelling event: {cancelMutation.error.message}
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Event Confirmation Modal */}
            <ConfirmModal
              open={showCancelModal}
              title="Cancel Event?"
              message="Are you sure you want to cancel this event? This action cannot be undone."
              confirmText="Yes, Cancel Event"
              cancelText="No, Keep Event"
              onConfirm={handleCancel}
              onCancel={() => setShowCancelModal(false)}
              confirmLoading={cancelMutation.isPending}
            />
          </>
        )}
    </div>
  );
}
