import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { invalidateUserProfile, useUserProfile } from "../hooks/useUserProfile";
import { AuthUtils } from "../utils/auth.utils";
import { MdError, MdLogout } from "react-icons/md";
import { ConfirmModal } from "./ConfirmModal";

export const UserProfileIndicator = () => {
  const nav = useNavigate();
  const { data: userProfile, isLoading, isError } = useUserProfile();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogout = () => {
    AuthUtils.clearToken();
    invalidateUserProfile();
    nav("/");
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-base-300">
          <div className="w-8 h-8 bg-base-content/20 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-base-content/20 rounded w-24 mb-1"></div>
            <div className="h-2 bg-base-content/20 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error alert-sm">
        <MdError className="w-4 h-4" />
        <span className="text-xs">Error loading profile</span>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center p-3">
        <p className="text-sm text-base-content/60">Not logged in</p>
        <div className="mt-2 space-y-1">
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={() => nav("/login")}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* User Info Card */}
      <button
        type="button"
        className="bg-base-100 rounded-lg p-2 border border-base-content/10 w-full text-left hover:bg-base-200 transition-colors"
        onClick={() => nav("/profile")}
      >
        <div className="flex items-center gap-2">
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-9 rounded-full flex items-center justify-center">
              <span className="text-md font-bold">
                {userProfile.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-base-content truncate"
              title={userProfile.email}
            >
              {userProfile.email}
            </p>
          </div>
        </div>
      </button>

      {/* Logout Button */}
      <button
        className="btn btn-outline btn-error btn-sm w-full gap-2 hover:scale-105 transition-transform"
        onClick={() => setShowLogoutModal(true)}
      >
        <MdLogout className="w-4 h-4" />
        Sign Out
      </button>
      <ConfirmModal
        open={showLogoutModal}
        title="Sign Out?"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={() => {
          setShowLogoutModal(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};
