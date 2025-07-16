import { PrismaClient } from '../../prisma/generated/prisma';
import { TRPCError } from '@trpc/server';

export class CommunityService {
    constructor(private readonly prisma: PrismaClient) {}

    private readonly communityPublicSelect = {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
        // add more public fields as needed
    };

    private async requireCommunityOwnerOrThrow(slug: string, userId: string) {
        const community = await this.prisma.community.findUnique({ where: { slug } });
        if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
        if (community.ownerId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        return community;
    }

    async createCommunity(data: { name: string; slug: string; description?: string }, ownerId: string) {
        const normalizedSlug = data.slug.toLowerCase();
        const existing = await this.prisma.community.findUnique({ where: { slug: normalizedSlug } });
        if (existing) {
            throw new TRPCError({ code: "CONFLICT", message: "A community with this slug already exists." });
        }
        return this.prisma.community.create({
            data: {
                name: data.name,
                slug: normalizedSlug,
                description: data.description,
                ownerId: ownerId,
            },
        });
    }

    async listCommunities() {
        return this.prisma.community.findMany({
            where: { archivedAt: null },
            select: this.communityPublicSelect,
        });
    }

    async getCommunityBySlug(slug: string, userId?: string) {
        // First get the public data
        const publicCommunity = await this.prisma.community.findUnique({
            where: { slug: slug },
            select: this.communityPublicSelect,
        });
        if (!publicCommunity) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });

        let isMember = false;
        let isOwner = false;

        type PrivateCommunityProfile = {
            numberOfMembers: number;
        }
        let privateCommunityProfile: PrivateCommunityProfile | null = null;

        if (userId) {
            // Check if the user is a member of the community
            const userCommunity = await this.prisma.userCommunity.findFirst({
                where: {
                    userId: userId,
                    community: { slug: slug },
                },
            });

            if (userCommunity) {
                isMember = true;
            }

            // Check if the user is the owner of the community
            if (publicCommunity.ownerId === userId) {
                isOwner = true;
            }

            // If user is a member or owner, get private data
            if (isMember || isOwner) {
                const numberOfMembers = await this.prisma.userCommunity.count({
                    where: { community: { slug: slug } }
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
    }

    async updateCommunity(slug: string, data: { name?: string; description?: string }, userId: string) {
        const community = await this.requireCommunityOwnerOrThrow(slug, userId);
        return this.prisma.community.update({
            where: { slug: slug },
            data: {
                name: data.name ?? community.name,
                description: data.description ?? community.description,
            },
        });
    }

    async archiveCommunity(slug: string, userId: string) {
        await this.requireCommunityOwnerOrThrow(slug, userId);
        return this.prisma.community.update({
            where: { slug: slug },
            data: { archivedAt: new Date() },
        });
    }

    async joinCommunity(slug: string, userId: string) {
        const community = await this.prisma.community.findUnique({ where: { slug: slug } });
        if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
        // Check if already a member
        const existing = await this.prisma.userCommunity.findUnique({
            where: {
                userId_communityId: {
                    userId: userId,
                    communityId: community.id,
                },
            },
        });
        if (existing) return { joined: true };
        await this.prisma.userCommunity.create({
            data: {
                userId: userId,
                communityId: community.id,
            },
        });
        return { joined: true };
    }

    async leaveCommunity(slug: string, userId: string) {
        const community = await this.prisma.community.findUnique({ where: { slug: slug } });
        if (!community) throw new TRPCError({ code: "NOT_FOUND", message: "Community not found" });
        // Don't allow owner to leave their own community
        if (community.ownerId === userId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Owner cannot leave their own community" });
        }
        await this.prisma.userCommunity.delete({
            where: {
                userId_communityId: {
                    userId: userId,
                    communityId: community.id,
                },
            },
        });
        return { left: true };
    }
}
