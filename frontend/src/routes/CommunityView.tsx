import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCommunity } from "../hooks/useCommunityPublic";
import { CommunityEventsList } from "../components/CommunityEventsList";
import { ConfirmModal } from "../components/ConfirmModal";
import { useJoinCommunity } from "../hooks/useJoinCommunity";
import { useLeaveCommunity } from "../hooks/useLeaveCommunity";
import { HiUserGroup, HiUserCircle, HiStar } from "react-icons/hi2";
// ...existing code...

export default function CommunityView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useCommunity(slug);
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  let statusIcon = (
    <HiUserGroup
      className="inline w-5 h-5 text-base-content/40 mr-1"
      title="Public"
    />
  );
  let statusText = "Public";
  if (data?.isOwner) {
    statusIcon = (
      <HiStar className="inline w-5 h-5 text-warning mr-1" title="Owner" />
    );
    statusText = "You are the owner";
  } else if (data?.isMember) {
    statusIcon = (
      <HiUserCircle
        className="inline w-5 h-5 text-success mr-1"
        title="Member"
      />
    );
    statusText = "You are a member";
  }

  const memberCount = data?.privateCommunityProfile?.numberOfMembers;

  // ...existing code...

  return (
    <>
      {/* Owner header bar */}
      {data?.isOwner && (
        <div className="mb-6">
          <div className="navbar bg-base-200 rounded-box shadow-lg px-4">
            <div className="flex-1">
              <span className="font-semibold text-lg ml-2">
                You are the owner of this community
              </span>
            </div>
            <div className="flex-none">
              <button
                className="btn btn-accent btn-sm "
                onClick={() => navigate(`/c/${slug}/create-event`)}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto py-8">
        {isLoading && <div className="loading loading-spinner loading-md" />}
        {error && (
          <div className="alert alert-error">Error loading community.</div>
        )}
        {!isLoading && !error && !data && (
          <div className="alert alert-info">Community not found.</div>
        )}
        {data && (
          <>
            <div className="card bg-base-100 shadow p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                {statusIcon}
                <h1 className="text-3xl font-bold mb-0">
                  {data.publicCommunityProfile.name}
                </h1>
              </div>
              <div className="text-base-content/60 text-sm mb-4 flex items-center gap-2">
                <span>Slug: {data.publicCommunityProfile.slug}</span>
                <span className="ml-4">{statusText}</span>
                {typeof memberCount === "number" && (
                  <span className="ml-4">Members: {memberCount}</span>
                )}
              </div>
              <div className="mb-4 flex items-center gap-4">
                {data.publicCommunityProfile.description || (
                  <span className="italic text-base-content/40">
                    No description
                  </span>
                )}
                {/* Join/Leave Button */}
                {!data.isOwner &&
                  (data.isMember ? (
                    <>
                      <button
                        className="btn btn-outline btn-error btn-sm"
                        onClick={() => setShowLeaveModal(true)}
                        disabled={leaveMutation.isPending}
                      >
                        {leaveMutation.isPending
                          ? "Leaving..."
                          : "Leave Community"}
                      </button>
                      <ConfirmModal
                        open={showLeaveModal}
                        title="Leave Community?"
                        message="Are you sure you want to leave this community?"
                        confirmText={
                          leaveMutation.isPending ? "Leaving..." : "Yes, Leave"
                        }
                        cancelText="Cancel"
                        onConfirm={() => {
                          setShowLeaveModal(false);
                          leaveMutation.mutate(slug!);
                        }}
                        onCancel={() => setShowLeaveModal(false)}
                        confirmLoading={leaveMutation.isPending}
                      />
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => joinMutation.mutate(slug!)}
                      disabled={joinMutation.isPending}
                    >
                      {joinMutation.isPending ? "Joining..." : "Join Community"}
                    </button>
                  ))}
              </div>
              <div className="text-xs text-base-content/40">
                Created:{" "}
                {new Date(
                  data.publicCommunityProfile.createdAt
                ).toLocaleDateString()}
                <br />
                Last updated:{" "}
                {new Date(
                  data.publicCommunityProfile.updatedAt
                ).toLocaleDateString()}
              </div>
            </div>

            <CommunityEventsList
              slug={data.publicCommunityProfile.slug}
              isOwner={data.isOwner}
              isMember={data.isMember}
            />
          </>
        )}
      </div>
    </>
  );
}
