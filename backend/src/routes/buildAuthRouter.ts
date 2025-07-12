import { PrismaClient } from '../../prisma/generated/prisma'
import { protectedProcedure, publicProcedure, router } from "../server/trpc";
import z from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../service/UserService';
import { provideDependencies } from '../provideDependencies';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; // Use a strong secret in production

export const buildAuthRouter = () => {
    const authRouter = router({
        register: publicProcedure
            .input(z.object({
                email: z.string().email(),
                password: z.string().min(6)
            }).strict())
            .mutation(async ({ input, ctx }) => {
                if (ctx.userId) {
                    throw new Error('Already authenticated');
                }
                const { userService } = provideDependencies();
                const user = await userService.createUser(
                    input.email,
                    input.password
                );
                return { message: "Registration successful", user: user.email };
            }),
        login: publicProcedure
            .input(z.object({
                email: z.string().email(),
                password: z.string().min(6)
            }))
            .output(z.object({ token: z.string() }).strict())
            .mutation(async ({ input, ctx }) => {
                if (ctx.userId) {
                    throw new Error('Already authenticated');
                }
                const { userService } = provideDependencies();
                const token = await userService.authenticateUser(
                    input.email,
                    input.password
                )
                return { token };
            }),
        getSelf: protectedProcedure
            .query(async ({ ctx }) => {
                const user = await prisma.user.findUnique({
                    where: { id: ctx.userId },
                    select: { id: true, email: true }
                });
                if (!user) throw new Error('User not found');
                return user;
            })
    });
    return authRouter;
}