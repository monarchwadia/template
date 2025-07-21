import { Dependencies } from "../provideDependencies.types";
import { publicProcedure, router } from "../server/trpc";
import { buildAuthRouter } from "./buildAuthRouter";
import { buildCommunityRouter } from "./buildCommunityRouter";
import { buildCalendarEventsRouter } from "./buildCalendarEventsRouter";

import { buildFileManagementRouter } from "./fileManagementRouter";
import { createTRPCClient } from "@trpc/client";

export const buildRootRouter = (deps: Dependencies) => {
  const appRouter = router({
    health: publicProcedure.query(() => {
      return { status: "ok" };
    }),
    auth: buildAuthRouter(deps),
    fileManagement: buildFileManagementRouter(deps),
    community: buildCommunityRouter(deps),
    calendarEvents: buildCalendarEventsRouter(deps),
  });

  return appRouter;
};

export type AppRouter = ReturnType<typeof buildRootRouter>;
export type TRPCClient = ReturnType<typeof createTRPCClient<AppRouter>>;
