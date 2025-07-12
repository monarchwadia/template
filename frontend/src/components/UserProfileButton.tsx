import { useUserProfile } from "../hooks/useUserProfile";

export const UserProfileIndicator = () => {
        const {
            data: userProfile,
            isLoading,
            isError,
            error
        } = useUserProfile();

    if (isLoading) {
        return <button className="btn btn-ghost loading">Loading...</button>;
    }
    if (isError) {
        return <button className="btn btn-ghost">Error: {error.message}</button>;
    }
    if (!userProfile) {
        return <></>;
    }
    return (
        <button className="btn btn-ghost">
            {userProfile.email}
        </button>
    );
}