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

    const now = new Date();
    // Hardcode Toronto Zendo West community and events
    const torontoZendo = await communityService.createCommunity(
      {
        name: "Toronto Zendo West",
        slug: "torontozendo",
        description:
          " We are a small sitting group in Toronto Canada associated with the Sanbo Zen lineage of practice. Students in the group have worked with a combination of teachers; Elaine MacInnes, Nenates Albert, Roselyn Stone, Dragan Petrovic, Brian Chisholm, Patrick Gallagher and Valerie Forstman. We are a private zendo, but inquiries can be made by email to torontozendowest@gmail.com.",
      },
      ownerUser.id
    );

    // 1 Tuesday sit (next Tuesday from now)
    function getNextTuesday(date: Date): Date {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const daysUntilTuesday = (2 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilTuesday);
      return d;
    }
    const nextTuesday = getNextTuesday(now);
    for (let i = 0; i < 2; i++) {
      const sitDate = new Date(nextTuesday);
      sitDate.setDate(sitDate.getDate() + i * 7);
      const sitStart = new Date(sitDate);
      sitStart.setHours(18, 0, 0, 0); // 6pm
      const sitEnd = new Date(sitDate);
      sitEnd.setHours(20, 0, 0, 0); // 8pm
      const zazenEvent = await calendarEventsService.createCalendarEvent(
        {
          title: "Weekly Zazen Sit",
          desc: "Regular Tuesday evening zazen with visiting teacher Stan Krzyzanowski.",
          location: "Toronto Zendo West",
          startDt: sitStart,
          endDt: sitEnd,
          communityId: torontoZendo.id,
        },
        ownerUser.id
      );
      await calendarEventsService.publishCalendarEvent(
        zazenEvent.id,
        ownerUser.id
      );
    }

    // Mini-sesshin: Fri July 26th 12pm to Sun July 28th 6pm at The Lakehouse
    const sesshinStart = new Date(now.getFullYear(), 6, 26, 12, 0, 0, 0); // July is 6 (0-based)
    const sesshinEnd = new Date(now.getFullYear(), 6, 28, 18, 0, 0, 0); // July 28th 6pm
    const sesshinEvent = await calendarEventsService.createCalendarEvent(
      {
        title: "Mini-Sesshin with Stan Krzyzanowski",
        desc: "A weekend mini-sesshin led by Stan Krzyzanowski at The Lakehouse.",
        location: "The Lakehouse",
        startDt: sesshinStart,
        endDt: sesshinEnd,
        communityId: torontoZendo.id,
      },
      ownerUser.id
    );
    await calendarEventsService.publishCalendarEvent(
      sesshinEvent.id,
      ownerUser.id
    );

    // Add dummy calendar events for each community
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
