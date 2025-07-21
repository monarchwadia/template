import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { UserService } from "../service/UserService";
import { PrismaClient } from "../../prisma/generated/prisma";
import { JwtService } from "../service/JwtService";
import { getAppConfig } from "../utils/getAppConfig";

// Create service instances
const appConfig = getAppConfig();
const prisma = new PrismaClient();
const jwtService = new JwtService(appConfig.jwtSecret);
const userService = new UserService(prisma, jwtService);

export async function createContext({ req }: CreateHTTPContextOptions) {
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    // Use UserService to get the user ID from the access token
    const user = await userService.getDbUserFromAccessToken(token);
    return {
      userId: user?.id,
    };
  }
  return {
    userId: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
