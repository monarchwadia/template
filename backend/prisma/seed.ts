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
                    name: "Kagyu Vajrayana Sangha",
                    slug: "kagyuvajrayana",
                    description: "A community for practitioners of the Kagyu lineage of Tibetan Buddhism.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Nyingma Dzogchen Circle",
                    slug: "nyingmadzogchen",
                    description: "Exploring the teachings of the Nyingma school and Dzogchen practice.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Zen Mountain Monastery",
                    slug: "zenmountain",
                    description: "A sangha for Zen practitioners, koan study, and zazen.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Thai Forest Tradition",
                    slug: "thaiforest",
                    description: "Meditation and teachings from the Thai Forest lineage.",
                    ownerId: user.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    name: "Yogic Pathways Sangha",
                    slug: "yogicpathways",
                    description: "A group for yogic and tantric meditation practitioners.",
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