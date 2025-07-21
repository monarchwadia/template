import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@coolproject/backend";
import { AuthUtils } from "../utils/auth.utils";
import { ca } from "zod/v4/locales";

const buildTrpcClient = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: apiUrl,
        headers: () => {
          // const token = AuthUtils.getToken();
          // if (token) {
          //   return {
          //     Authorization: `Bearer ${token}`,
          //   }
          // } else {
          //   return {};
          // }

          // new oidc logic
          try {
            const oidcTokenEndpointResponse = localStorage.getItem(
              "oidc_token_endpoint_response"
            );

            if (oidcTokenEndpointResponse) {
              const tokenData = JSON.parse(oidcTokenEndpointResponse);
              if (tokenData && tokenData.access_token) {
                return {
                  Authorization: `Bearer ${tokenData.access_token}`,
                };
              }
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
