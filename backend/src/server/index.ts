// import { db } from "./db";
import { buildRootRouter } from "../routes/buildRootRouter";
import express from "express";
import type { Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { Dependencies } from "../provideDependencies.types";

export const buildServer = (deps: Dependencies): Express => {
  const app = express();
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: buildRootRouter(deps),
      createContext,
    })
  );
  return app;
};
