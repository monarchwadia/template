import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function createContext({ req }: CreateHTTPContextOptions) {
  let userId: string | null = null;
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch (e) {
      // Invalid token, userId remains null
    }
  }
  return { userId };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
