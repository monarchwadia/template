import { useParams } from "react-router-dom";
import { useCommunityPublic } from "../hooks/useCommunityPublic";

export default function CommunityView() {
  const { slug } = useParams();
  const { data, isLoading, error } = useCommunityPublic(slug);

  return (
    <div className="container mx-auto py-8">
      {isLoading && <div className="loading loading-spinner loading-md" />}
      {error && <div className="alert alert-error">Error loading community.</div>}
      {!isLoading && !error && !data && (
        <div className="alert alert-info">Community not found.</div>
      )}
      {data && (
        <div className="card bg-base-100 shadow p-6">
          <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
          <div className="text-base-content/60 text-sm mb-4">
            Slug: {data.slug}
          </div>
          <div className="mb-4">
            {data.description || (
              <span className="italic text-base-content/40">No description</span>
            )}
          </div>
          <div className="text-xs text-base-content/40">
            Created:{" "}
            {new Date(data.createdAt).toLocaleDateString()}
            <br />
            Last updated:{" "}
            {new Date(data.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
