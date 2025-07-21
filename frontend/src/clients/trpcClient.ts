import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "special-secret-trpc-type-sharing-path";
import { AuthUtils } from "../utils/auth.utils";

const buildTrpcClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  // see https://discord-questions.trpc.io/m/1255433713991290931
  // @ts-expect-error - Workaround so that we dont have to install backend just for TRPC types
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
