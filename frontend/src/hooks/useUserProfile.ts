import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "../clients/trpcClient";
import { AuthUtils } from "../utils/auth.utils";
import { queryClient } from "../clients/reactQueryClient";

const keys = {
  userProfile: ["user-profile"],
};

export function useUserProfile() {
  const userQueryResult = useQuery({
    queryKey: keys.userProfile,
    queryFn: async () => {
      // const token = AuthUtils.getToken();
      // if (!token) return null;
      // // Set token in trpc client headers if needed
      // // (Assumes trpc client supports setting headers dynamically)
      // return await trpcClient.auth.getSelf.query();

      // new oidc logic
      try {
        const oidcTokenEndpointResponse =
          AuthUtils.getOidcTokenEndpointResponse();
        if (
          !oidcTokenEndpointResponse ||
          !oidcTokenEndpointResponse.access_token
        )
          return null;
        // Set the token in the trpc client headers
        return await trpcClient.auth.getSelf.query();
      } catch (error: unknown) {
        console.error("Error parsing OIDC token endpoint response:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return userQueryResult;
}

export const invalidateUserProfile = async () => {
  await queryClient.invalidateQueries({ queryKey: keys.userProfile });
};
