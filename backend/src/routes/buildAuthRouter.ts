import { PrismaClient } from '../../prisma/generated/prisma'
import { protectedProcedure, publicProcedure, router } from "../server/trpc";
import { TRPCError } from '@trpc/server';
import z from 'zod';
import { provideDependencies } from '../provideDependencies';

const prisma = new PrismaClient();

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
            .output(z.object({
                success: z.literal(true),
                token: z.string()
            }))
            .mutation(async ({ input, ctx }) => {
                if (ctx.userId) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Already authenticated'
                    });
                }
                const { userService } = provideDependencies();
                try {
                    const token = await userService.authenticateUser(
                        input.email,
                        input.password
                    );
                    return { success: true, token };
                } catch (error) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: error instanceof Error ? error.message : 'Invalid credentials'
                    });
                }
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