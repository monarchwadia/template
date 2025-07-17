
import { PrismaClient } from '../../prisma/generated/prisma';

export class EmailService {
    constructor(private readonly prisma: PrismaClient) {}

    async sendEventUpdatedEmail(eventId: string, eventTitle: string, recipientEmails: string[]): Promise<void> {
        const subject = `Event Updated: ${eventTitle}`;
        const body = `Event "${eventTitle}" has been updated. Please check the latest details.`;
        await Promise.all(recipientEmails.map(to =>
            this.prisma.emailOutbox.create({
                data: { to, subject, body }
            })
        ));
    }

    async sendEventCancelledEmail(eventId: string, eventTitle: string, recipientEmails: string[]): Promise<void> {
        const subject = `Event Cancelled: ${eventTitle}`;
        const body = `Event "${eventTitle}" has been cancelled. We apologize for any inconvenience.`;
        await Promise.all(recipientEmails.map(to =>
            this.prisma.emailOutbox.create({
                data: { to, subject, body }
            })
        ));
    }

    async sendEventPublishedEmail(eventId: string, eventTitle: string, recipientEmails: string[]): Promise<void> {
        const subject = `Event Published: ${eventTitle}`;
        const body = `Event "${eventTitle}" has been published and is now available for registration.`;
        await Promise.all(recipientEmails.map(to =>
            this.prisma.emailOutbox.create({
                data: { to, subject, body }
            })
        ));
    }
}
