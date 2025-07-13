
import { GuardMustBeLoggedIn } from "../guards/GuardMustBeLoggedIn";
import { useUserProfile } from "../hooks/useUserProfile";

export default function Profile() {
  const { data: user, isLoading, isError, error } = useUserProfile();

  return (
    <GuardMustBeLoggedIn>
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <div className="border border-base-300 rounded-lg p-8 min-w-[300px] bg-base-100 shadow">
          {isLoading && <div className="animate-pulse text-base-content/60">Loading...</div>}
          {isError && <div className="text-error">{error instanceof Error ? error.message : "Failed to load profile."}</div>}
          {user && (
            <>
              {/* <p><strong>Username:</strong> {user.username}</p> */}
              <p><strong>Email:</strong> {user.email}</p>
              {/* Add more fields as needed */}
            </>
          )}
        </div>
      </div>
    </GuardMustBeLoggedIn>
  );
}
