import bcrypt from "bcrypt";
import { PrismaClient, User } from "../../prisma/generated/prisma";
import { JwtService } from "./JwtService";
import * as client from "openid-client";
import { getAppConfig } from "../utils/getAppConfig";
import { TRPCError } from "@trpc/server";
import { userInfo } from "os";

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

  async getUserInfoFromOidc(
    accessToken: string
  ): Promise<client.UserInfoResponse | null> {
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
      const userinfo = await client.fetchUserInfo(
        config,
        accessToken,
        client.skipSubjectCheck
      );

      return userinfo;
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

  async getDbUserFromAccessToken(accessToken: string): Promise<User | null> {
    const userinfo = await this.getUserInfoFromOidc(accessToken);
    if (!userinfo || !userinfo.sub) {
      return null;
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { oidcSub: userinfo.sub },
    });
    return dbUser;
  }

  async ensureUserProfileExists(accessToken: string): Promise<void> {
    // Reuse the existing method to get userinfo
    const userinfo = await this.getUserInfoFromOidc(accessToken);

    if (!userinfo) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid access token",
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { oidcSub: userinfo.sub },
    });

    if (existingUser) {
      // User already exists, no-op
      if (process.env.NODE_ENV === "development") {
        console.log(`User with oidcSub ${userinfo.sub} already exists`);
      }
      return;
    }

    // Create new user from userinfo
    const newUser = await this.createUser({
      oidcSub: userinfo.sub,
      email: userinfo.email || undefined,
      name: userinfo.name || undefined,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`Created new user:`, {
        id: newUser.id,
        oidcSub: newUser.oidcSub,
        email: newUser.email,
        name: newUser.name,
      });
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
