import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@coolproject/backend";
import { AuthUtils } from "../utils/auth.utils";

const buildTrpcClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: apiUrl,
        headers: () => {
          try {
            const oidcTokenEndpointResponse =
              AuthUtils.getOidcTokenEndpointResponse();

            if (
              oidcTokenEndpointResponse &&
              oidcTokenEndpointResponse.access_token
            ) {
              return {
                Authorization: `Bearer ${oidcTokenEndpointResponse.access_token}`,
              };
            }

            return {};
          } catch (error: unknown) {
            console.error("Error while setting OIDC token in headers:", error);
            return {};
          }
        },
      }),
    ],
  });
  return trpc;
};

export const trpcClient = buildTrpcClient();
