import { PrismaClient } from "../../prisma/generated/prisma";
import { TRPCError } from "@trpc/server";

export class AuthorizationUtils {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Check if user has access to a community (as owner or member)
   * @param userId - The user ID to check
   * @param communityId - The community ID to check access for
   * @returns Object with isOwner and isMember flags
   */
  async checkCommunityAccess(userId: string, communityId: string) {
    const isOwner = await this.prisma.community.findFirst({
      where: { id: communityId, ownerId: userId },
    });

    if (isOwner) {
      return { isOwner: true, isMember: true };
    }

    const isMember = await this.prisma.userCommunity.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    return { isOwner: false, isMember: !!isMember };
  }

  /**
   * Require user to be a member of a community or throw error
   * @param userId - The user ID to check
   * @param communityId - The community ID to check access for
   * @throws TRPCError if user is not a member
   */
  async requireCommunityMember(userId: string, communityId: string) {
    const { isOwner, isMember } = await this.checkCommunityAccess(
      userId,
      communityId
    );

    if (!isOwner && !isMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be a member of the community to perform this action",
      });
    }

    return { isOwner, isMember };
  }

  /**
   * Require user to be an owner of a community or throw error
   * @param userId - The user ID to check
   * @param communityId - The community ID to check access for
   * @throws TRPCError if user is not an owner
   */
  async requireCommunityOwner(userId: string, communityId: string) {
    const { isOwner } = await this.checkCommunityAccess(userId, communityId);

    if (!isOwner) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "You must be the owner of the community to perform this action",
      });
    }

    return true;
  }
}
