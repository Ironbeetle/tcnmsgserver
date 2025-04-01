import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { recipients, message } = body;

        // Validate input
        if (!recipients || !message || !recipients.length) {
            return NextResponse.json(
                { error: 'Recipients and message are required' },
                { status: 400 }
            );
        }

        // Send SMS to each recipient
        const results = await Promise.all(
            recipients.map(async (recipient: any) => {
                try {
                    const result = await client.messages.create({
                        body: message,
                        to: recipient.contact_number, // Make sure this matches your Member type
                        from: process.env.TWILIO_PHONE_NUMBER,
                    });
                    return {
                        success: true,
                        recipient: recipient.contact_number,
                        messageId: result.sid
                    };
                } catch (error: any) {
                    return {
                        success: false,
                        recipient: recipient.contact_number,
                        error: error.message
                    };
                }
            })
        );

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('SMS sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send SMS' },
            { status: 500 }
        );
    }
}