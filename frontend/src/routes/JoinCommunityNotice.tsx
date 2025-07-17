import { useJoinCommunity } from "../hooks/useJoinCommunity";
import { useState } from "react";

export function JoinCommunityNotice({ slug }: { slug: string }) {
  const joinMutation = useJoinCommunity();
  const [clicked, setClicked] = useState(false);

  const handleJoin = () => {
    setClicked(true);
    joinMutation.mutate(slug);
  };

  return (
    <div className="alert alert-info flex flex-col items-start gap-2">
      <div className="font-semibold text-lg">Membership required to view events</div>
      <div className="text-sm">
        This community's events are visible to members only. If you join, you will be able to:
        <ul className="list-disc ml-6 mt-1">
          <li>View the full calendar of upcoming and past events</li>
          <li>Receive event updates and notifications</li>
        </ul>
        <div className="mt-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleJoin}
            disabled={joinMutation.isPending || clicked}
          >
            {joinMutation.isPending || clicked ? "Joining..." : "Join Community"}
          </button>
        </div>
        {joinMutation.isError && (
          <div className="mt-2 text-error text-xs">{(joinMutation.error as Error)?.message || "Failed to join. Please try again."}</div>
        )}
      </div>
    </div>
  );
}
