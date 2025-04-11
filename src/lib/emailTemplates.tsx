import { render } from '@react-email/render';

interface NotificationTemplateProps {
    title: string;
    message: string;
}

export const NotificationTemplate = ({ title, message }: NotificationTemplateProps) => (
    <div style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
    }}>
        <h2 style={{ color: '#333' }}>{title}</h2>
        <div style={{
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '5px',
        }}>
            {message}
        </div>
        <div style={{
            marginTop: '20px',
            fontSize: '12px',
            color: '#666',
        }}>
            This is an automated message from TCN Message Server
        </div>
    </div>
);

export const renderEmailTemplate = async (props: NotificationTemplateProps): Promise<string> => {
    const template = NotificationTemplate(props);
    return await render(template);
};
