import { useCommunityList } from '../hooks/useCommunityList';
import { Link } from 'react-router-dom';

export default function CommunityList() {
  const { data, isLoading, error } = useCommunityList();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Communities</h1>
      {isLoading && <div className="loading loading-spinner loading-md" />}
      {error && <div className="alert alert-error">Error loading communities.</div>}
      {data && data.length === 0 && <div className="alert alert-info">No communities found.</div>}
      {data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((community) => (
            <li key={community.id} className="card bg-base-100 shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <Link to={`/communities/${community.slug}`} className="link link-primary text-lg font-semibold">
                  {community.name}
                </Link>
                <div className="text-base-content/60 text-sm">{community.description}</div>
              </div>
              <div className="text-xs text-base-content/40 mt-2 md:mt-0">
                Created: {new Date(community.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
