import { provideDependencies } from "../src/provideDependencies";
import { UserService } from "../src/service/UserService";
import { PrismaClient, User } from "./generated/prisma";


async function main() {
    const deps = provideDependencies();
    const { userService, prisma } = deps;
    try {
        // Clear existing data
        await prisma.fileAsset.deleteMany();
        await prisma.userCommunity.deleteMany();
        await prisma.community.deleteMany();
        await prisma.user.deleteMany();

        // Create a dummy user
        const user = await userService.createUser("user@user.com", "password");

        // Add dummy communities
        await prisma.community.createMany({
            data: [
                {
                    name: "Downtown Soccer Club",
                    slug: "downtownsoccer",
                    description: "A group for local soccer enthusiasts of all skill levels.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "City Basketball League",
                    slug: "citybasketball",
                    description: "Join weekly basketball games and tournaments in the city.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Morning Runners",
                    slug: "morningrunners",
                    description: "Early risers who love to run together before work.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Weekend Tennis Group",
                    slug: "weekendtennis",
                    description: "Casual and competitive tennis matches every weekend.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Community Cycling Crew",
                    slug: "cyclingcrew",
                    description: "Group rides and cycling adventures for all ages.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        });
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