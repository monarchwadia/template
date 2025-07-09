import { publicProcedure, router } from "../server/trpc";

export const buildRootRouter = () => {
    const appRouter = router({
        health: publicProcedure.query(() => {
            return { status: "ok" };
        })
    });

    return appRouter
}