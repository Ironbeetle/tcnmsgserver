import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use app-specific password if using Gmail
    },
});

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
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to.join(', '),
            subject,
            html,
            attachments: attachments.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content
            }))
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}