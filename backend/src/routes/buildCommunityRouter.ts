import { router, publicProcedure, protectedProcedure } from "../server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Dependencies } from "../provideDependencies.types";

export const buildCommunityRouter = (deps: Dependencies) => {
  const { communityService } = deps;
  const communityRouter = router({
    // Create a community (anyone)
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          slug: z
            .string()
            .min(2)
            .regex(
              /^[a-z0-9]+$/,
              "Slug must be lowercase, no spaces or dashes, only a-z0-9"
            ),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.userId)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        return communityService.createCommunity(input, ctx.userId);
      }),

    // List all communities (anyone)
    list: publicProcedure.query(async () => {
      return communityService.listCommunities();
    }),

    // View community data (public for everyone, private for members)
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        return communityService.getCommunityBySlug(
          input.slug,
          ctx.userId ?? undefined
        );
      }),

    // Update community (owners only)
    update: protectedProcedure
      .input(
        z.object({
          slug: z.string(),
          name: z.string().min(2).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return communityService.updateCommunity(input.slug, input, ctx.userId);
      }),

    // Archive community (owners only)
    archive: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return communityService.archiveCommunity(input.slug, ctx.userId);
      }),

    // Join a community (members only)
    join: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return communityService.joinCommunity(input.slug, ctx.userId);
      }),

    // Leave a community (members only)
    leave: protectedProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return communityService.leaveCommunity(input.slug, ctx.userId);
      }),
  });
  return communityRouter;
};
