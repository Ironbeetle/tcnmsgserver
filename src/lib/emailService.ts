import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailAttachment {
    filename: string;
    content: Buffer;
}

export async function sendEmail({
    to,
    subject,
    html,
    attachments = []
}: {
    to: string[];
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'TCN Message Server <notifications@amontech.ca>',
            to: to,
            subject: subject,
            html: html,
            attachments: attachments.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content
            }))
        });

        if (error) {
            throw error;
        }

        const attachmentData = attachments.length > 0 
            ? {
                fileCount: attachments.length,
                fileNames: attachments.map(a => a.filename)
            }
            : Prisma.JsonNull;

        // Log successful email
        await prisma.emailLog.create({
            data: {
                subject,
                message: html,
                recipients: to,
                status: 'sent',
                messageId: data?.id,
                attachments: attachmentData
            }
        });

        return { success: true, messageId: data?.id };
    } catch (error) {
        const attachmentData = attachments.length > 0 
            ? {
                fileCount: attachments.length,
                fileNames: attachments.map(a => a.filename)
            }
            : Prisma.JsonNull;

        // Log failed attempt
        await prisma.emailLog.create({
            data: {
                subject,
                message: html,
                recipients: to,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                attachments: attachmentData
            }
        });

        console.error('Email sending error:', error);
        throw error;
    }
}
