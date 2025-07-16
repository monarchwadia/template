import { PrismaClient } from '../../prisma/generated/prisma'
import { router, publicProcedure, protectedProcedure } from "../server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Dependencies } from '../provideDependencies.types';

const prisma = new PrismaClient();

const communityPublicSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  // add more public fields as needed
};

async function requireCommunityOwnerOrThrow(slug: string, userId: string, prisma: PrismaClient) {
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
  if (community.ownerId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
  return community;
}

export const buildCommunityRouter = (deps: Dependencies) => {
    const communityRouter = router({
      // Create a community (anyone)
      create: publicProcedure
        .input(z.object({
          name: z.string().min(2),
          slug: z.string().min(2).regex(/^[a-z0-9]+$/, "Slug must be lowercase, no spaces or dashes, only a-z0-9"),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
          const normalizedSlug = input.slug.toLowerCase();
          const existing = await prisma.community.findUnique({ where: { slug: normalizedSlug } });
          if (existing) {
            throw new TRPCError({ code: "CONFLICT", message: "A community with this slug already exists." });
          }
          return prisma.community.create({
            data: {
              name: input.name,
              slug: normalizedSlug,
              description: input.description,
              ownerId: ctx.userId,
            },
          });
        }),

      // List all communities (anyone)
      list: publicProcedure.query(async () => {
        return prisma.community.findMany({
          where: { archivedAt: null },
          select: communityPublicSelect,
        });
      }),

      // View public data of a community (anyone)
      getPublic: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input }) => {
          const community = await prisma.community.findUnique({
            where: { slug: input.slug },
            select: communityPublicSelect,
          });
          if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
          return community;
        }),

      // View full data (members only)
      getFull: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input, ctx }) => {
          const community = await prisma.community.findUnique({
            where: { slug: input.slug },
            include: {
              joinedUserCommunities: {
                where: { userId: ctx.userId },
                select: { userId: true, communityId: true, joinedAt: true },
              },
            },
          });
          if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
          const isMember = community.joinedUserCommunities.some(j => j.userId === ctx.userId);
          if (!isMember && community.ownerId !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member" });
          // Remove owner and joinedUserCommunities from the returned object
          const { owner, joinedUserCommunities, ...publicData } = community as any;
          return publicData;
        }),

      // Update community (owners only)
      update: protectedProcedure
        .input(z.object({
          slug: z.string(),
          name: z.string().min(2).optional(),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const community = await requireCommunityOwnerOrThrow(input.slug, ctx.userId, prisma);
          return prisma.community.update({
            where: { slug: input.slug },
            data: {
              name: input.name ?? community.name,
              description: input.description ?? community.description,
            },
          });
        }),

      // Archive community (owners only)
      archive: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .mutation(async ({ input, ctx }) => {
          await requireCommunityOwnerOrThrow(input.slug, ctx.userId, prisma);
          return prisma.community.update({
            where: { slug: input.slug },
            data: { archivedAt: new Date() },
          });
        }),
    });
    return communityRouter;
}