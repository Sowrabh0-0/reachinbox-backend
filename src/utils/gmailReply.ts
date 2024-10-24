import { google } from 'googleapis';
import { oauth2Client } from './oauthUtils';

// Function to send a reply
export const sendGmailReply = async (tokens: any, to: string, subject: string, body: string) => {
    const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
    oauth2Client.setCredentials(tokens);

    const rawMessage = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `to: ${to}\n`,
        `subject: ${subject}\n\n`,
        body,
    ].join('');

    const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        const response = await gmailClient.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log('Email sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
