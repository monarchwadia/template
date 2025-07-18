import { initTRPC } from "@trpc/server";
import { Context } from "./context";
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new Error("Not authenticated");
    }
    return next({
      ctx: {
        userId: ctx.userId,
      },
    });
  })
);
