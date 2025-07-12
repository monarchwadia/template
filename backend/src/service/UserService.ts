import bcrypt from 'bcrypt';
import { PrismaClient } from '../../prisma/generated/prisma';
import { JwtService } from './JwtService';

export class UserService {
    constructor(private readonly prisma: PrismaClient, private jwtService: JwtService) {}

    async createUser(email: string, password: string) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error('User already exists');
        const hashed = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: {
                email,
                passwordHash: hashed,
            },
        });
    }

    async authenticateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new Error('Invalid credentials');
        return this.jwtService.createToken(user.id, user.email);
    }
}