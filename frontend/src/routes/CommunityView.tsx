import { useParams } from "react-router-dom";

export default function CommunityView() {
  const { slug } = useParams();
  // TODO: Fetch and display community details by slug
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Community: {slug}</h1>
      <div className="alert alert-info">Community details coming soon.</div>
    </div>
  );
}
