import { Dependencies } from "../provideDependencies.types";
import { publicProcedure, router } from "../server/trpc";
import { buildAuthRouter } from "./buildAuthRouter";

import { buildFileManagementRouter } from "./fileManagementRouter";

export const buildRootRouter = (deps: Dependencies) => {
    const appRouter = router({
        health: publicProcedure.query(() => {
            return { status: "ok" };
        }),
        auth: buildAuthRouter(deps),
        fileManagement: buildFileManagementRouter(deps),
    });

    return appRouter;
}

export type AppRouter = ReturnType<typeof buildRootRouter>;