import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;
        const recipientsJson = formData.get('recipients') as string;
        const recipients = JSON.parse(recipientsJson);
        const attachmentFiles = formData.getAll('attachments') as File[];

        // Validate input
        if (!recipients || !subject || !message) {
            return NextResponse.json(
                { error: 'Recipients, subject, and message are required' },
                { status: 400 }
            );
        }

        // Process attachments
        const attachments = await Promise.all(
            attachmentFiles.map(async (file) => {
                const buffer = await file.arrayBuffer();
                return {
                    filename: file.name,
                    content: Buffer.from(buffer)
                };
            })
        );

        // Filter recipients with valid email addresses
        const validRecipients = recipients
            .filter((recipient: any) => recipient.email)
            .map((recipient: any) => recipient.email);

        if (validRecipients.length === 0) {
            return NextResponse.json(
                { error: 'No valid email recipients found' },
                { status: 400 }
            );
        }

        // Send email
        const result = await sendEmail({
            to: validRecipients,
            subject,
            html: message, // You might want to add HTML formatting here
            attachments
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        );
    }
}