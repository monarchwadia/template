import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import * as client from "openid-client";
import { getAppConfig } from "../utils/getAppConfig";

const appConfig = getAppConfig();

const retrieveConfig = async () => {
  let config: client.Configuration;
  if (process.env.NODE_ENV === "development") {
    // Allow insecure requests to HTTP in development mode
    config = await client.discovery(
      new URL(appConfig.oidcServerUrl),
      appConfig.oidcClientId,
      undefined,
      undefined,
      {
        execute: [client.allowInsecureRequests],
      }
    );
  } else {
    config = await client.discovery(
      new URL(appConfig.oidcServerUrl),
      appConfig.oidcClientId
    );
  }
  return config;
};

export async function createContext({ req }: CreateHTTPContextOptions) {
  let userId: string | null = null;
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      const config = await retrieveConfig();

      // Fetch user info using the access token
      // Note: We use client.skipSubjectCheck since we don't have the expected subject
      const userinfo = await client.fetchUserInfo(
        config,
        token,
        client.skipSubjectCheck
      );

      // userinfo.sub is the user's unique identifier
      userId = userinfo.sub;
    } catch (e) {
      // Invalid token, userId remains null
      if (process.env.NODE_ENV === "development") {
        console.error("OIDC token verification failed:", e);
      }
    }
  }
  return { userId };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
