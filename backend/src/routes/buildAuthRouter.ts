import { PrismaClient } from "../../prisma/generated/prisma";
import { protectedProcedure, publicProcedure, router } from "../server/trpc";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { Dependencies } from "../provideDependencies.types";

const prisma = new PrismaClient();

export const buildAuthRouter = (deps: Dependencies) => {
  const authRouter = router({
    getSelf: protectedProcedure.query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: {
          id: true,
          email: true,
          ownedCommunities: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          joinedUserCommunities: {
            select: {
              community: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      });
      if (!user) throw new Error("User not found");
      // Flatten joinedUserCommunities to just an array of communities
      const joinedCommunities = user.joinedUserCommunities.map(
        (j) => j.community
      );
      return {
        id: user.id,
        email: user.email,
        ownedCommunities: user.ownedCommunities,
        joinedCommunities,
      };
    }),

    /*
     *
     *
     *
     * The new authentication flow using OIDC goes past this line.
     *
     *
     */
    ensureUserProfile: publicProcedure
      .input(
        z.object({
          accessToken: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        // This procedure is called after OIDC login to ensure the user profile exists in our DB.
        // If the user profile does not exist, it should be created.
        // No new session is created here, as the OIDC flow handles that.
        if (ctx.userId) {
          // Just return early if the user is already authenticated
          return {
            success: true,
          };
        }

        const { userService } = deps;
        try {
          // Use the access token to fetch user info from OIDC provider
          const userInfo = await userService.getUserInfoFromOidc(
            input.accessToken
          );
          if (!userInfo) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid access token",
            });
          }

          // Ensure the user profile exists in our DB
          await userService.createUser(userInfo);
          return { success: true };
        }
      }),
  });
  return authRouter;
};
