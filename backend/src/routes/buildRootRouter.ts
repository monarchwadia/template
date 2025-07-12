import { publicProcedure, router } from "../server/trpc";
import { buildAuthRouter } from "./buildAuthRouter";

export const buildRootRouter = () => {
    const appRouter = router({
        health: publicProcedure.query(() => {
            return { status: "ok" };
        }),
        auth: buildAuthRouter()
    });

    return appRouter
}