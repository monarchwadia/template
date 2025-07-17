import nodemailer from 'nodemailer';
import { PrismaClient } from '../../prisma/generated/prisma';

// Create a Nodemailer transport that just logs emails to the console
const transport = nodemailer.createTransport({
    name: 'console',
    streamTransport: true,
    newline: 'unix',
    buffer: true
});

const prisma = new PrismaClient();

export async function processEmailOutbox() {
    // Get unsent emails (sentAt is null)
    const unsentEmails = await prisma.emailOutbox.findMany({
        where: { sentAt: null },
        orderBy: { createdAt: 'asc' },
        take: 10 // batch size
    });

    for (const email of unsentEmails) {
        try {
            await transport.sendMail({
                from: 'noreply@coolproject.local',
                to: email.to,
                subject: email.subject,
                text: email.body
            });
            // Mark as sent
            await prisma.emailOutbox.update({
                where: { id: email.id },
                data: { sentAt: new Date(), error: null }
            });
            console.log(`[emailJob] Sent email to ${email.to} (id: ${email.id})`);
        } catch (err: any) {
            await prisma.emailOutbox.update({
                where: { id: email.id },
                data: { error: err.message || String(err) }
            });
            console.error(`[emailJob] Failed to send email to ${email.to}:`, err);
        }
    }
}

processEmailOutbox()
.then(() => console.log('[emailJob] Email processing completed'))
.catch(console.error);

// // Example: run every 10 seconds if run directly
// if (require.main === module) {
//     setInterval(() => {
//         processEmailOutbox().catch(console.error);
//     }, 10000);
//     console.log('[emailJob] Email job started. Processing every 10 seconds...');
// }
