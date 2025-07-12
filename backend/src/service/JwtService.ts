import jwt from 'jsonwebtoken';
import { UserSessionContents } from './JwtService.types';

export class JwtService {
    constructor(private jwtSecret: string) {}

    createToken(userId: string, email: string): string {
        return jwt.sign({ userId, email }, this.jwtSecret, { expiresIn: '1y' });
    }

    decodeToken(token: string): UserSessionContents | null {
        const decoded = jwt.verify(token, this.jwtSecret) as UserSessionContents;
        return decoded;
    }
}