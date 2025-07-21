import { PrismaClient } from "../../prisma/generated/prisma";
import { EmailService } from "../service/EmailService";
import { retryWithExponentialBackoff } from "../utils/retryWithExponentialBackoff";

const prisma = new PrismaClient();
const emailService = new EmailService(prisma);

async function getUpcomingEventsForCommunity(communityId: string) {
  // Get events in the next 7 days, not cancelled
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return prisma.calendarEvent.findMany({
    where: {
      communityId,
      startDt: { gte: now, lte: weekFromNow },
      cancelledAt: null,
      publishedAt: { not: null },
    },
    orderBy: { startDt: "asc" },
  });
}

async function getRecentlyPublishedFutureEvents(communityId: string) {
  // Get events published in the last week, with a future start date
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return prisma.calendarEvent.findMany({
    where: {
      communityId,
      publishedAt: { gte: weekAgo, lte: now },
      startDt: { gt: now },
      cancelledAt: null,
    },
    orderBy: { publishedAt: "desc" },
  });
}

async function getCommunityMembers(communityId: string) {
  const members = await prisma.userCommunity.findMany({
    where: { communityId },
    include: { user: true },
  });
  return members;
}

function formatEventList(events: any[]) {
  if (events.length === 0) return "No upcoming events this week.";
  return events
    .map(
      (e) =>
        `- ${e.title} (${e.startDt.toLocaleString()}${e.location ? ` @ ${e.location}` : ""})`
    )
    .join("\n");
}

async function sendWeeklyCommunityDigests() {
  const communities = await prisma.community.findMany({
    where: { archivedAt: null },
  });

  for (const community of communities) {
    try {
      const upcomingEvents = await getUpcomingEventsForCommunity(community.id);
      const recentPublishedEvents = await getRecentlyPublishedFutureEvents(
        community.id
      );
      const memberEmails = await getCommunityMembers(community.id);
      if (memberEmails.length === 0) continue;

      const subject = `Weekly Digest: Upcoming Events in ${community.name}`;
      let body = `Hello!\n\nHere are the upcoming events in your community for the next week:\n\n${formatEventList(upcomingEvents)}`;

      body += `\n\n---\n\nRecently Published Events (with future dates):\n\n${formatEventList(recentPublishedEvents)}`;

      body += `\n\nSee you there!`;

      const existingEmails: string[] = [];
      for (const member of memberEmails) {
        // Filter out null/undefined emails
        if (member.user.email) {
          existingEmails.push(member.user.email);
        }
      }
      await emailService.sendGenericEmail(existingEmails, subject, body);

      console.log(
        `[weeklyDigestJob] Queued digest for ${memberEmails.length} members of community ${community.name}`
      );
    } catch (err) {
      console.error(
        `[weeklyDigestJob] Failed to queue digest for community ${community.name}:`,
        err
      );
      // Continue with next community
    }
  }
}

// Use the generic retry utility for digest job
retryWithExponentialBackoff(
  async () => {
    await sendWeeklyCommunityDigests();
    console.log("[weeklyDigestJob] Weekly digests sent");
  },
  {
    maxHours: 72,
    initialDelayMs: 1000,
    maxDelayMs: 60 * 60 * 1000,
  }
);
