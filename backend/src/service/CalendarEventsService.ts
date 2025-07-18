import { PrismaClient } from "../../prisma/generated/prisma";
import { TRPCError } from "@trpc/server";
import { EmailService } from "./EmailService";

export class CalendarEventsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: EmailService
  ) {}

  private async requireCommunityOwnerOrThrow(
    communityId: string,
    userId: string
  ) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: { owner: true },
    });
    if (!community)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Community not found",
      });
    if (community.ownerId !== userId)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only community owners can manage events",
      });
    return community;
  }

  private async getCommunityMemberEmails(
    communityId: string
  ): Promise<string[]> {
    const members = await this.prisma.userCommunity.findMany({
      where: { communityId },
      include: { user: true },
    });
    return members.map((member) => member.user.email);
  }

  async createCalendarEvent(
    data: {
      title: string;
      desc?: string;
      location?: string;
      startDt: Date;
      endDt: Date;
      timezone?: string;
      communityId: string;
    },
    userId: string
  ) {
    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(data.communityId, userId);

    // Validate dates
    if (data.startDt >= data.endDt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start date must be before end date",
      });
    }

    return this.prisma.calendarEvent.create({
      data: {
        title: data.title,
        desc: data.desc,
        location: data.location,
        startDt: data.startDt,
        endDt: data.endDt,
        timezone: data.timezone ?? "UTC",
        communityId: data.communityId,
      },
      include: {
        community: true,
      },
    });
  }

  async viewCalendarEvent(eventId: string, userId?: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: {
        community: true,
      },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Check if user is a member of the community or the owner
    if (userId) {
      const isOwner = event.community.ownerId === userId;
      const isMember = await this.prisma.userCommunity.findUnique({
        where: {
          userId_communityId: {
            userId: userId,
            communityId: event.communityId,
          },
        },
      });

      if (!isOwner && !isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member of the community to view this event",
        });
      }

      // If event is not published, only community owner can view it
      if (!event.publishedAt && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Event is not published",
        });
      }
    } else {
      // Not logged in - cannot view any events
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be logged in to view events",
      });
    }

    return event;
  }

  async updateCalendarEvent(
    eventId: string,
    data: {
      title?: string;
      desc?: string;
      location?: string;
      startDt?: Date;
      endDt?: Date;
      timezone?: string;
    },
    userId: string
  ) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(event.communityId, userId);

    // Validate dates if provided
    const startDt = data.startDt ?? event.startDt;
    const endDt = data.endDt ?? event.endDt;
    if (startDt >= endDt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start date must be before end date",
      });
    }

    const updatedEvent = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: data.title ?? event.title,
        desc: data.desc ?? event.desc,
        location: data.location ?? event.location,
        startDt: startDt,
        endDt: endDt,
        timezone: data.timezone ?? event.timezone,
      },
      include: {
        community: true,
      },
    });

    // Send update notification to community members if event is published
    if (event.publishedAt) {
      const memberEmails = await this.getCommunityMemberEmails(
        event.communityId
      );
      await this.emailService.sendEventUpdatedEmail(
        eventId,
        updatedEvent.title,
        memberEmails
      );
    }

    return updatedEvent;
  }

  async cancelCalendarEvent(eventId: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(event.communityId, userId);

    if (event.cancelledAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Event is already cancelled",
      });
    }

    const cancelledEvent = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        cancelledAt: new Date(),
      },
      include: {
        community: true,
      },
    });

    // Send cancellation notification to community members if event was published
    if (event.publishedAt) {
      const memberEmails = await this.getCommunityMemberEmails(
        event.communityId
      );
      await this.emailService.sendEventCancelledEmail(
        eventId,
        cancelledEvent.title,
        memberEmails
      );
    }

    return cancelledEvent;
  }

  async publishCalendarEvent(eventId: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(event.communityId, userId);

    if (event.publishedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Event is already published",
      });
    }

    if (event.cancelledAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot publish a cancelled event",
      });
    }

    const publishedEvent = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        publishedAt: new Date(),
      },
      include: {
        community: true,
      },
    });

    // Send published notification to community members
    const memberEmails = await this.getCommunityMemberEmails(event.communityId);
    await this.emailService.sendEventPublishedEmail(
      eventId,
      publishedEvent.title,
      memberEmails
    );

    return publishedEvent;
  }

  async hideCalendarEvent(eventId: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(event.communityId, userId);

    if (!event.publishedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Event is not published",
      });
    }

    const hiddenEvent = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        publishedAt: null,
      },
      include: {
        community: true,
      },
    });

    return hiddenEvent;
  }

  async unpublishCalendarEvent(eventId: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { community: true },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar event not found",
      });
    }

    // Verify user is community owner
    await this.requireCommunityOwnerOrThrow(event.communityId, userId);

    if (!event.publishedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Event is not published",
      });
    }

    // TODO: Check if there are any signups - for now we'll skip this check
    // In a real implementation, you'd query a signup/registration table
    // const signupCount = await this.prisma.eventSignup.count({ where: { eventId } });
    // if (signupCount > 0) {
    //     throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot unpublish event with existing signups" });
    // }

    const unpublishedEvent = await this.prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        publishedAt: null,
      },
      include: {
        community: true,
      },
    });

    return unpublishedEvent;
  }

  async listCalendarEvents(communityId?: string, userId?: string) {
    const where: any = {};

    if (communityId) {
      where.communityId = communityId;
    }

    // Only show published events for non-owners
    if (userId) {
      // Check if user is owner of any communities with events
      const ownedCommunities = await this.prisma.community.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const ownedCommunityIds = ownedCommunities.map((c) => c.id);

      if (ownedCommunityIds.length > 0) {
        where.OR = [
          { publishedAt: { not: null } },
          { communityId: { in: ownedCommunityIds } },
        ];
      } else {
        where.publishedAt = { not: null };
      }
    } else {
      where.publishedAt = { not: null };
    }

    // Don't show cancelled events
    where.cancelledAt = null;

    return this.prisma.calendarEvent.findMany({
      where,
      include: {
        community: true,
      },
      orderBy: {
        startDt: "asc",
      },
    });
  }
}
