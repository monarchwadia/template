import { provideDependencies } from "../src/provideDependencies";
import { UserService } from "../src/service/UserService";
import { PrismaClient, User } from "./generated/prisma";

async function main() {
  const deps = provideDependencies();
  const { userService, communityService, prisma } = deps;
  try {
    // Clear existing data
    await prisma.fileAsset.deleteMany();
    await prisma.userCommunity.deleteMany();
    await prisma.calendarEvent.deleteMany();
    await prisma.community.deleteMany();
    await prisma.user.deleteMany();

    // Create a dummy user
    const ownerUser = await userService.createUser(
      "owner@owner.com",
      "password"
    );
    const userUser = await userService.createUser("user@user.com", "password");

    // Add dummy communities using the CommunityService
    const communitySeeds = [
      {
        name: "Downtown Soccer Club",
        slug: "downtownsoccer",
        description:
          "A group for local soccer enthusiasts of all skill levels.",
      },
      {
        name: "City Basketball League",
        slug: "citybasketball",
        description:
          "Join weekly basketball games and tournaments in the city.",
      },
      {
        name: "Morning Runners",
        slug: "morningrunners",
        description: "Early risers who love to run together before work.",
      },
      {
        name: "Weekend Tennis Group",
        slug: "weekendtennis",
        description: "Casual and competitive tennis matches every weekend.",
      },
      {
        name: "Community Cycling Crew",
        slug: "cyclingcrew",
        description: "Group rides and cycling adventures for all ages.",
      },
    ];
    const { calendarEventsService } = deps;
    const createdCommunities = [];
    for (const community of communitySeeds) {
      const created = await communityService.createCommunity(
        community,
        ownerUser.id
      );
      createdCommunities.push(created);
    }

    // Add dummy calendar events for each community
    const now = new Date();
    for (const community of createdCommunities) {
      // Event 1: Future event
      await calendarEventsService.createCalendarEvent(
        {
          title: `Welcome Event for ${community.name}`,
          desc: `Kickoff event for the ${community.name}! Meet members and learn more.`,
          location: "Community Center",
          startDt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endDt: new Date(
            now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ), // +2 hours
          communityId: community.id,
        },
        ownerUser.id
      );

      // Event 2: Another future event
      await calendarEventsService.createCalendarEvent(
        {
          title: `${community.name} Social`,
          desc: `A fun social gathering for all members of ${community.name}.`,
          location: "Local Park",
          startDt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          endDt: new Date(
            now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
          ), // +3 hours
          communityId: community.id,
        },
        ownerUser.id
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("Database seeded successfully");
  })
  .catch((e) => {
    console.error("Error seeding database:", e);
  });
