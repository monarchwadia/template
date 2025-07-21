import bcrypt from "bcrypt";
import { PrismaClient } from "../../prisma/generated/prisma";
import { JwtService } from "./JwtService";
import * as client from "openid-client";
import { getAppConfig } from "../utils/getAppConfig";

const appConfig = getAppConfig();

type CreateUserParams = {
  oidcSub: string; // OIDC sub claim
  email?: string;
  name?: string;
};

export class UserService {
  private configCache: client.Configuration | null = null;

  constructor(
    private readonly prisma: PrismaClient,
    private jwtService: JwtService
  ) {}

  private async getOidcConfig(): Promise<client.Configuration> {
    if (this.configCache) {
      return this.configCache;
    }

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

    this.configCache = config;
    return config;
  }

  async getUserInfoFromAccessToken(
    accessToken: string
  ): Promise<string | null> {
    try {
      const config = await this.getOidcConfig();

      // Debug: Check if userinfo endpoint is available
      if (process.env.NODE_ENV === "development") {
        const serverMetadata = config.serverMetadata();
        console.log(
          "OIDC Server userinfo_endpoint:",
          serverMetadata.userinfo_endpoint
        );
        console.log("OIDC Server issuer:", serverMetadata.issuer);
        console.log(
          "Token (first 20 chars):",
          accessToken.substring(0, 20) + "..."
        );
      }

      // Fetch user info using the access token
      // Note: We use client.skipSubjectCheck since we don't have the expected subject
      const userinfo = await client.fetchUserInfo(
        config,
        accessToken,
        client.skipSubjectCheck
      );

      // userinfo.sub is the user's unique identifier
      return userinfo.sub;
    } catch (e) {
      // Invalid token, return null
      if (process.env.NODE_ENV === "development") {
        console.error("OIDC token verification failed:", e);
        // Log more details about the error for debugging
        if (e instanceof Error) {
          console.error("Error name:", e.name);
          console.error("Error message:", e.message);
          // Check if it's a WWW-Authenticate challenge error
          if ("code" in e) {
            console.error("Error code:", (e as any).code);
          }
          if ("cause" in e && e.cause) {
            console.error("Error cause:", e.cause);
          }
        }
      }
      return null;
    }
  }

  async createUser(params: CreateUserParams) {
    const { oidcSub, email, name } = params;
    const existing = await this.prisma.user.findUnique({ where: { oidcSub } });
    if (existing) throw new Error("User already exists");
    return this.prisma.user.create({
      data: {
        email,
        name,
        oidcSub,
      },
    });
  }
}
