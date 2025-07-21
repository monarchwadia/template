import { useEffect, useRef } from "react";
import { consumeCallback } from "../oidc/Oidc";
import { trpcClient } from "../clients/trpcClient";

export const AuthCallbackPage = () => {
  const callbackConsumed = useRef(false);
  useEffect(() => {
    if (callbackConsumed.current) {
      // Prevent multiple calls if the component re-renders, and in dev mode
      return;
    }
    callbackConsumed.current = true;
    consumeCallback()
      .then((token) => {
        // Handle successful authentication, e.g., redirect to home or profile
        trpcClient.auth.ensureUserProfile
          .mutate({
            accessToken: token.access_token,
          })
          .then(() => {
            console.log("User profile ensured successfully.");
            window.location.href = "/";
          });
      })
      .catch((error) => {
        console.error("Authentication callback error:", error);
        alert("Authentication failed. Please try again.");
        // Handle error, e.g., show an error message or redirect to login
        window.location.href = "/login";
      });
  }, []);
  return (
    <div>
      <h1>Authentication Callback</h1>
      <p>This is where the authentication callback will be handled.</p>
    </div>
  );
};
