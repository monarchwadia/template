import { UserService } from "../src/service/UserService";
import { PrismaClient, User } from "./generated/prisma";


async function main() {
    const prisma = new PrismaClient();
    try {
        const userService: UserService  = new UserService(prisma);
        // Clear existing data
        await prisma.user.deleteMany();
        await userService.createUser("user@user.com", "password");
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
    })