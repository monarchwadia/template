import { useParams } from "react-router-dom";
import { useCommunity } from "../hooks/useCommunityPublic";
import { HiUserGroup, HiUserCircle, HiStar} from "react-icons/hi2";

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

  return (
    <div className="container mx-auto py-8">
      {isLoading && <div className="loading loading-spinner loading-md" />}
      {error && <div className="alert alert-error">Error loading community.</div>}
      {!isLoading && !error && !data && (
        <div className="alert alert-info">Community not found.</div>
      )}
      {data && (
        <div className="card bg-base-100 shadow p-6">
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
      )}
    </div>
  );
}
