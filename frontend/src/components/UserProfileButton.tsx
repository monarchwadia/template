import { useNavigate } from "react-router-dom";
import { invalidateUserProfile, useUserProfile } from "../hooks/useUserProfile";
import { AuthUtils } from "../utils/auth.utils";

export const UserProfileIndicator = () => {
    const nav = useNavigate();
        const {
            data: userProfile,
            isLoading,
            isError,
            error
        } = useUserProfile();

    const handleLogout = () => {
        AuthUtils.clearToken();
        invalidateUserProfile();
        nav("/");
    }

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
        <div>
            <button className="btn btn-ghost">
                {userProfile.email}
            </button>
            <button className="btn btn-ghost ml-2" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}