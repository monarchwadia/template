import { PrismaClient } from '../../prisma/generated/prisma'
import { protectedProcedure, publicProcedure, router } from "../server/trpc";
import z from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
                const existing = await prisma.user.findUnique({ where: { email: input.email } });
                if (existing) throw new Error('User already exists');
                const hashed = await bcrypt.hash(input.password, 10);
                const user = await prisma.user.create({
                    data: { email: input.email, passwordHash: hashed }
                });
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
                const user = await prisma.user.findUnique({ where: { email: input.email } });
                if (!user) throw new Error('Invalid credentials');
                const valid = await bcrypt.compare(input.password, user.passwordHash);
                if (!valid) throw new Error('Invalid credentials');
                const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
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