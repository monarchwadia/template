import { PrismaClient } from '../../prisma/generated/prisma'
import { protectedProcedure, publicProcedure, router } from "../server/trpc";
import { TRPCError } from '@trpc/server';
import z from 'zod';
import { Dependencies } from '../provideDependencies.types';

const prisma = new PrismaClient();

export const buildAuthRouter = (deps: Dependencies) => {
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
                const { userService } = deps;
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
                const { userService } = deps;
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
                    select: {
                        id: true,
                        email: true,
                        ownedCommunities: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                description: true,
                                createdAt: true,
                                updatedAt: true,
                            }
                        },
                        joinedUserCommunities: {
                            select: {
                                community: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        description: true,
                                        createdAt: true,
                                        updatedAt: true,
                                    }
                                }
                            }
                        }
                    }
                });
                if (!user) throw new Error('User not found');
                // Flatten joinedUserCommunities to just an array of communities
                const joinedCommunities = user.joinedUserCommunities.map(j => j.community);
                return {
                    id: user.id,
                    email: user.email,
                    ownedCommunities: user.ownedCommunities,
                    joinedCommunities,
                };
            })
    });
    return authRouter;
}