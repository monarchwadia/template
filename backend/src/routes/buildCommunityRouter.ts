import { PrismaClient } from '../../prisma/generated/prisma'
import { router, publicProcedure, protectedProcedure } from "../server/trpc";
import { number, z } from "zod";
import { TRPCError } from "@trpc/server";

const prisma = new PrismaClient();

const communityPublicSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
  // add more public fields as needed
};

async function requireCommunityOwnerOrThrow(slug: string, userId: string, prisma: PrismaClient) {
  const community = await prisma.community.findUnique({ where: { slug } });
  if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
  if (community.ownerId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
  return community;
}

export const buildCommunityRouter = () => {
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

      // View community data (public for everyone, private for members)
      get: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ input, ctx }) => {
          // First get the public data
          const publicCommunity = await prisma.community.findUnique({
            where: { slug: input.slug },
            select: communityPublicSelect,
          });
          if (!publicCommunity) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });

          let isMember = false;
          let isOwner = false;

          type PrivateCommunityProfile = {
            numberOfMembers: number;
          }
          let privateCommunityProfile: PrivateCommunityProfile | null = null;

          if (ctx.userId) {
            // Check if the user is a member of the community
            const userCommunity = await prisma.userCommunity.findFirst({
              where: {
                userId: ctx.userId,
                community: { slug: input.slug },
              },
            });

            if (userCommunity) {
              isMember = true;
            }

            // Check if the user is the owner of the community
            if (publicCommunity.ownerId === ctx.userId) {
              isOwner = true;
            }

            // If user is a member or owner, get private data
            if (isMember || isOwner) {
              const numberOfMembers = await prisma.userCommunity.count({
                where: { community: { slug: input.slug } }
              });
              privateCommunityProfile = {
                numberOfMembers
              }
            }
          }

          return {
            publicCommunityProfile: publicCommunity,
            privateCommunityProfile,
            isMember,
            isOwner,
          };
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

      // Join a community (members only)
      join: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const community = await prisma.community.findUnique({ where: { slug: input.slug } });
          if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
          // Check if already a member
          const existing = await prisma.userCommunity.findUnique({
            where: {
              userId_communityId: {
                userId: ctx.userId,
                communityId: community.id,
              },
            },
          });
          if (existing) return { joined: true };
          await prisma.userCommunity.create({
            data: {
              userId: ctx.userId,
              communityId: community.id,
            },
          });
          return { joined: true };
        }),

      // Leave a community (members only)
      leave: protectedProcedure
        .input(z.object({ slug: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const community = await prisma.community.findUnique({ where: { slug: input.slug } });
          if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
          // Don't allow owner to leave their own community
          if (community.ownerId === ctx.userId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Owner cannot leave their own community" });
          }
          await prisma.userCommunity.delete({
            where: {
              userId_communityId: {
                userId: ctx.userId,
                communityId: community.id,
              },
            },
          });
          return { left: true };
        }),
    });
    return communityRouter;
}