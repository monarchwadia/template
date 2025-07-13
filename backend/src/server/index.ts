// import { db } from "./db";
import { buildRootRouter } from "../routes/buildRootRouter";
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext } from './context';

const rootRouter = buildRootRouter();

export type AppRouter = typeof rootRouter;

export const buildServer = () => {
  const app = express();
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: rootRouter,
      createContext,
    })
  );
  return app;
}

