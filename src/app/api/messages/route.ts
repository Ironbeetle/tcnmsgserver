import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { created: 'desc' },
            take: 100,
            include: {
                user: true
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const type = formData.get('type') as string;
        const message = formData.get('message') as string;
        const recipients = JSON.parse(formData.get('recipients') as string);
        const subject = formData.get('subject') as string;
        
        let attachments: File[] = [];
        if (type === 'email') {
            formData.getAll('attachments').forEach((file) => {
                if (file instanceof File) {
                    attachments.push(file);
                }
            });
        }

        // Save message to database
        const savedMessage = await prisma.message.create({
            data: {
                type,
                message,
                subject: type === 'email' ? subject : null,
                userId: 'user-id-here' // You'll need to get the actual user ID from your auth context
            }
        });

        // Send message based on type
        if (type === 'sms') {
            // Implement SMS sending logic
            // Example: await sendSMS(recipients, message);
        } else if (type === 'email') {
            // Implement email sending logic
            // Example: await sendEmail(recipients, subject, message, attachments);
        }

        return NextResponse.json(savedMessage);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
