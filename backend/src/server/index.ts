// import { db } from "./db";
import { buildRootRouter } from "../routes/buildRootRouter";
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext } from './context';

const rootRouter = buildRootRouter();

export type AppRouter = typeof rootRouter;

export const buildServer = () => {   
  const server = createHTTPServer({
    router: rootRouter,
    createContext
  });

  return server;
}

