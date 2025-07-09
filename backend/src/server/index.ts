// import { db } from "./db";
import { publicProcedure, router } from "./trpc";
import { createHTTPServer } from '@trpc/server/adapters/standalone';

const appRouter = router({
    health: publicProcedure.query(() => {
        return { status: "ok" };
    })
});

export type AppRouter = typeof appRouter;

export const buildServer = () => {   
  const server = createHTTPServer({
    router: appRouter
  });

  return server;
}

